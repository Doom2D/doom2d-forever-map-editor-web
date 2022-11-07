interface MessageValue {
  type:
    | 'boolean'
    | 'numbers'
    | 'position'
    | 'select'
    | 'selectlocale'
    | 'string'
  localeName: string
  entity: number
  value: unknown[]
}

interface MessageNumbers {
  val: number
  localeName: string
  max: number
  min: number
}

interface MessageSelect {
  val: string
  localeName: string
}

interface MessageSelectLocale {
  val: string
  localeName: string
}

function messageValueIsNumbers(src: string[], x: unknown): x is number {
  if (src[0] === 'POSITION') return true
  if (src[0] === 'DIMENSION') return true
  return false
}

function messageValueIsSelectLocale(src: string[], x: unknown): x is string {
  if (src[0] === 'PANELTYPE') return true
  return false
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
  valueIsBoolean,
  messageValueIsNumbers,
  messageValueIsSelectLocale
}
