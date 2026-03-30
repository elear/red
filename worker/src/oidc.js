import { base64url } from 'rfc4648'
import * as cookie from 'cookie'

function authorize (env, state, scope) {
	return Response.redirect(
		`${env.OIDC_CLIENT_AUTHORIZATION_ENDPOINT}?response_type=code&client_id=${env.OIDC_CLIENT_ID}&redirect_uri=${env.OIDC_CLIENT_REDIRECT_URI}&scope=${scope.join('%20')}&state=${state}`,
		302
	)
}

async function exchange (env, code) {
	const res = await fetch(env.OIDC_CLIENT_TOKEN_ENDPOINT, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: env.OIDC_CLIENT_ID,
			client_secret: env.OIDC_CLIENT_SECRET,
			code,
			redirect_uri: env.OIDC_CLIENT_REDIRECT_URI,
		})
	}).then(res => res.json())
	if (res && res.id_token && res.id_token.indexOf('.') > 0) {
		const verifyResult = await verify(env, res.id_token)
		return verifyResult.isValid ? {
			...verifyResult,
			token: res.id_token
		} : null
	} else {
		return null
	}
}

function decodeJWT (token) {
	const parts = token.split('.')
	return {
		header: JSON.parse(new TextDecoder().decode(base64url.parse(parts[0], { loose: true }))),
		payload: JSON.parse(new TextDecoder().decode(base64url.parse(parts[1], { loose: true }))),
		signature: base64url.parse(parts[2], { loose: true })
	}
}

export async function verify (env, token) {
	const jwks = await fetch(env.OIDC_CLIENT_KEYS_ENDPOINT, {
		cf: {
			cacheTtl: 86400,
			cacheEverything: true
		}
	}).then(res => res.json())

	const jwt = decodeJWT(token)
	const keyData = jwks.keys.find(k => k.kid == jwt.header.kid)
	if (!keyData) {
		return {
			isValid: false
		}
	}
	const key = await crypto.subtle.importKey('jwk', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])

	const jwsSigningInput = token.split('.').slice(0, 2).join('.')
	const isValid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, jwt.signature, new TextEncoder().encode(jwsSigningInput))
	return {
		isValid,
		isExpired: Math.floor(Date.now() / 1000) >= jwt.payload.exp,
		expiration: jwt.payload.exp
	}
}

// --------------------------------------------------------
// REQUEST HANDLERS
// --------------------------------------------------------
export async function login (req, env) {
	const state = crypto.randomUUID()
	const returnPath = req.query.p || 'none'
	await env.KV_STATE.put(`state-${state}`, returnPath, { expirationTtl: 120 })

	return authorize(env, state, ['openid', 'email', 'roles'])
}

export async function callback (req, env) {
	try {
		const code = req.query.code
		const state = req.query.state

		// User reject authorize application
		if (!code) {
			return new Response('Failed to authenticate', { status: 401 })
		}

		// Return state mismatch
		const savedState = await env.KV_STATE.get(`state-${state}`)
		if (!savedState) {
			return new Response('Invalid Authentication Response', { status: 401 })
		}

		// Exchange ID Token
		const result = await exchange(env, code)
		if (!result) {
			return new Response('Invalid Token', { status: 401 })
		}

		// Redirect user to original URL
		const response = new Response(null, { status: 302, headers: new Headers() })
		if (savedState && savedState !== 'none') {
			response.headers.append('Location', savedState)
		} else {
			response.headers.append('Location', '/')
		}

		// Save ID token
		response.headers.set('Set-Cookie', cookie.serialize('jwt', result.token, {
			httpOnly: true,
			secure: true,
			path: '/',
			maxAge: result.expiration - Math.floor(Date.now() / 1000)
		}))

		return response
	} catch (err) {
		console.log(err)
		return new Response(null, { status: 500 })
	}
}