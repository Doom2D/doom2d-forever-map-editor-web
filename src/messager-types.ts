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

interface MessageBoolean {
  val: boolean
  localeName: string
}

interface MessagePosition {
  val: [MessageNumbers, MessageNumbers]
  localeName: string
  localeNames: [string, string]
}

function messageValueIsNumbers(src: string[], x: unknown): x is number {
  if (src[0] === 'POSITION') return true
  if (src[0] === 'DIMENSION') return true
  if (src[0] === 'ID') return true
  if (src[0] === 'ALPHA') return true
  return false
}

function messageValueIsSelectLocale(src: string[], x: unknown): x is string {
  if (src[0] === 'PANELTYPE') return true
  return false
}

function messageValueIsSelect(src: string[], x: unknown): x is string {
  if (src[0] === 'PANELTEXTURE') return true
  return false
}

function messageValueIsBoolean(src: string[], x: unknown): x is boolean {
  if (src[0] === 'PLATFORMINFO') {
    if (src[1] === 'PLATFORMACTIVEINFOVALUE') return true
    if (src[1] === 'PLATFORMONCEINFOVALUE') return true
  }
  return false
}

function messageValueIsPosition(src: string[], x: unknown): x is number {
  if (src[0] === 'PLATFORMINFO') {
    if (src[1] === 'PLATFORMMOVESPEEDVALUE') {
      if (src[2] === 'X') return true
      if (src[2] === 'Y') return true
    }
  }
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
): v is MessagePosition[] {
  return m.type === 'position'
}

function valueIsBoolean(
  m: Readonly<MessageValue>,
  v: Readonly<unknown[]>
): v is MessageBoolean[] {
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
  messageValueIsSelectLocale,
  messageValueIsSelect,
  messageValueIsBoolean,
  messageValueIsPosition
}
