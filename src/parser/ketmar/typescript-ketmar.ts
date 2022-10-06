/* eslint-disable unicorn/no-null */
/* eslint-disable regexp/strict */
/* eslint-disable regexp/require-unicode-regexp */
/* eslint-disable require-unicode-regexp */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createToken, Lexer, EmbeddedActionsParser } from 'chevrotain'

import { type objectItem, type obj } from './item-types'

const trueToken = createToken({
  name: 'True',
  pattern: /true/i,
})
const falseToken = createToken({
  name: 'False',
  pattern: /false/i,
})
const nullToken = createToken({
  name: 'Null',
  pattern: /null/i,
})
const lCurlyToken = createToken({
  name: 'LCurly',
  pattern: /{/,
})
const rCurlyToken = createToken({
  name: 'RCurly',
  pattern: /}/,
})
const lBracketToken = createToken({
  name: 'LBracket',
  pattern: /\(/,
})
const rBracketToken = createToken({
  name: 'RBracket',
  pattern: /\)/,
})
const semiToken = createToken({
  name: 'Colon',
  pattern: /;/,
})
const verticalToken = createToken({
  name: 'Vertical',
  pattern: /\|/,
})
const numberToken = createToken({
  name: 'Number',
  pattern: /-?\d+/,
})
const stringToken = createToken({
  name: 'String',
  pattern: /'(.*?)'/,
})
const identifierToken = createToken({
  name: 'Id',
  pattern: /\w+/,
})
const whitespaceToken = createToken({
  name: 'Whitespace',
  group: Lexer.SKIPPED,
  pattern: /[\t\n\r ]+/,
})
const comment = createToken({
  name: 'Comment',
  pattern: /\/\/.*/,
  group: Lexer.SKIPPED,
})
const multilineComment = createToken({
  name: 'Comment',
  pattern: /\/\*[^]*?\*\//,
  group: Lexer.SKIPPED,
})
const ketmarTokens = [
  comment,
  multilineComment,
  whitespaceToken,
  trueToken,
  falseToken,
  nullToken,
  lCurlyToken,
  rCurlyToken,
  lBracketToken,
  rBracketToken,
  stringToken,
  verticalToken,
  numberToken,
  semiToken,
  identifierToken,
]

const ketmarLexer = new Lexer(ketmarTokens)

class KetmarParserTypeScript extends EmbeddedActionsParser {
  public mapBindings: Record<string, string> = {}

  public readonly ketmarMap = this.RULE('ketmarMap', () => {
    this.CONSUME(identifierToken)
    return this.SUBRULE(this.object)
  })

  private readonly ketmarIdentifier = this.RULE(
    'ketmarIdentifier',
    () => this.CONSUME(identifierToken).image
  )

  private readonly ketmarTwoValues = this.RULE('ketmarTwoValues', () => {
    this.CONSUME(lBracketToken)
    const number1 = Number(this.CONSUME2(numberToken).image)
    const number2 = Number(this.CONSUME3(numberToken).image)
    this.CONSUME4(rBracketToken)
    return [number1, number2]
  })

  private readonly ketmarDigits = this.RULE('ketmarDigits', () => {
    const number = this.CONSUME(numberToken)
    return Number(number.image)
  })

  private readonly ketmarNull = this.RULE('ketmarNull', () => {
    this.CONSUME(nullToken)
    return null
  })

  private readonly ketmarBool = this.RULE('ketmarBool', () =>
    this.OR([
      {
        ALT: () => {
          this.CONSUME(falseToken)
          return false
        },
      },
      {
        ALT: () => {
          this.CONSUME(trueToken)
          return true
        },
      },
    ])
  )

  private readonly ketmarString = this.RULE('ketmarString', () =>
    this.CONSUME(stringToken).image.slice(1, -1)
  )

  private readonly bitMask = this.RULE('bitmask', () => {
    const toggledBits: string[] = []

    // so that we don't have conflicts with ketmarIdentifier
    const firstBit = this.CONSUME(identifierToken).image
    this.CONSUME(verticalToken)
    toggledBits.push(firstBit)
    this.MANY_SEP({
      SEP: verticalToken,

      DEF: () => {
        const bit = this.CONSUME1(identifierToken).image
        toggledBits.push(bit)
      },
    })
    return toggledBits
  })

  private readonly objectItem = this.RULE('objectItem', () => {
    const key = this.CONSUME(identifierToken).image
    const value: obj | objectItem = this.OR([
      {
        ALT: () => this.SUBRULE(this.object),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarBool),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarNull),
      },
      {
        ALT: () => this.SUBRULE(this.bitMask),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarDigits),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarIdentifier),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarString),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarTwoValues),
      },
    ])
    this.CONSUME1(semiToken)
    return [key, value] as [string, obj | objectItem]
  })

  private readonly object = this.RULE('object', () => {
    this.CONSUME(lCurlyToken)
    const temporaryObject: obj = {}
    this.MANY({
      DEF: () => {
        this.OR([
          {
            ALT: () => {
              const parsed = this.SUBRULE(this.objectItem)
              temporaryObject[parsed[0]] = parsed[1]
            },
          },
          {
            ALT: () => {
              const type = this.SUBRULE(this.ketmarIdentifier)
              const parsed = this.SUBRULE1(this.objectItem)
              temporaryObject[parsed[0]] = parsed[1]
              this.mapBindings[parsed[0]] = type
            },
          },
        ])
      },
    })
    this.CONSUME(rCurlyToken)
    return temporaryObject
  })

  public constructor() {
    super(ketmarTokens, {
      recoveryEnabled: true,
    })
    this.performSelfAnalysis()
  }
}

const parser = new KetmarParserTypeScript()

export default function parseKetmar(text: string) {
  const lexResult = ketmarLexer.tokenize(text)
  parser.input = lexResult.tokens
  const cst = parser.ketmarMap()
  return cst
}
