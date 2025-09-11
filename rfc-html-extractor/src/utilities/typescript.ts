export const assertNever = (value: never) => {
  throw new Error('Unexpected value: ' + value)
}

export function assertIsString(val: unknown, errorMessage: string): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error(`Not a string typeof=${typeof val}. ${errorMessage}`)
  }
}
