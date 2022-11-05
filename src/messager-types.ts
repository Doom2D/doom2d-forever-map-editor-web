interface MessageValue {
  type:
    | 'boolean'
    | 'numbers'
    | 'position'
    | 'select'
    | 'selectlocale'
    | 'string'
  localeName: string
  value: unknown[]
}

interface MessageNumbers {
  val: number
  localeName: string
}

interface MessageSelect {
  val: string
  localeName: string
}

interface MessageSelectLocale {
  val: string
  localeName: string
}

function valueIsNumbers(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is MessageNumbers[] {
  return m.type === 'numbers'
}

function valueIsString(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is string[] {
  return m.type === 'string'
}

function valueIsSelect(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is MessageSelect[] {
  return m.type === 'select'
}

function valueIsSelectLocale(m: Readonly<MessageValue>, v: Readonly<unknown[]>): v is MessageSelectLocale[] {
  return m.type === 'selectlocale'
}

function valueIsPosition(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is never[] {
  return m.type === 'position'
}

function valueIsBoolean(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is never[] {
  return m.type === 'boolean'
}

export {
  type MessageValue,
  valueIsNumbers,
  valueIsString,
  valueIsSelect,
  valueIsPosition,
  valueIsSelectLocale,
  valueIsBoolean
}
