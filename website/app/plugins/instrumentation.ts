import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'

function initializeTelemetry() {
  const provider = new WebTracerProvider({
    resource: defaultResource().merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'red',
        [ATTR_SERVICE_VERSION]: '0.0.1',
      })
    ),
    spanProcessors: [
      new BatchSpanProcessor(new OTLPTraceExporter({ url: 'https://heimdall-otlp.ietf.org/v1/traces' }))
    ]
  })

  provider.register({
    contextManager: new ZoneContextManager()
  })

  registerInstrumentations({
    instrumentations: getWebAutoInstrumentations({
      "@opentelemetry/instrumentation-fetch": {
        propagateTraceHeaderCorsUrls: [new RegExp(`\\/api\\/*`)],
      }
    })
  })
}

export default defineNuxtPlugin({
  name: 'opentelemetry-plugin',
  async setup() {
    initializeTelemetry()
  }
})
