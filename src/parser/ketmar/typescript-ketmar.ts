// "Wtf is this?" - you might say. "Something wrong with tsc." - I would answer.
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-named-as-default-member */
import chevrotain from '../../third-party/chevrotain/chevrotain.js'

const { createToken, Lexer, EmbeddedActionsParser } = chevrotain
type Rule = chevrotain.Rule

const trueToken = createToken({
  name: 'True',
  pattern: /true/iu,
})
const falseToken = createToken({
  name: 'False',
  pattern: /false/iu,
})
const nullToken = createToken({
  name: 'Null',
  pattern: /null/iu,
})
const lCurlyToken = createToken({
  name: 'LCurly',
  pattern: /\{/u,
})
const rCurlyToken = createToken({
  name: 'RCurly',
  pattern: /\}/u,
})
const lBracketToken = createToken({
  name: 'LBracket',
  pattern: /\(/u,
})
const rBracketToken = createToken({
  name: 'RBracket',
  pattern: /\)/u,
})
const semiToken = createToken({
  name: 'Colon',
  pattern: /;/u,
})
const verticalToken = createToken({
  name: 'Vertical',
  pattern: /\|/u,
})
const numberToken = createToken({
  name: 'Number',
  pattern: /-?\d+/u,
})
const stringToken = createToken({
  name: 'String',
  pattern: /'(.*?)'/u,
})
const identifierToken = createToken({
  name: 'Id',
  pattern: /\w+/u,
})
const whitespaceToken = createToken({
  name: 'Whitespace',
  group: Lexer.SKIPPED,
  pattern: /[ \t\n\r]+/u,
})
const comment = createToken({
  name: 'Comment',
  pattern: /\/\/.*/u,
  group: Lexer.SKIPPED,
})
const multilineComment = createToken({
  name: 'Comment',
  pattern: /\/\*[\s\S]*?\*\//u,
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
    const value:
      | number[]
      | Record<string, unknown>
      | string[]
      | boolean
      | number
      | string = this.OR([
      {
        ALT: () => this.SUBRULE(this.object),
      },
      {
        ALT: () => this.SUBRULE(this.ketmarBool),
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
    return [key, value]
  })

  private readonly object = this.RULE('object', () => {
    this.CONSUME(lCurlyToken)
    const temporaryObject: Record<string, unknown> = {}
    this.MANY({
      DEF: () => {
        this.OR([
          {
            ALT: () => {
              // @ts-expect-error It's fine trust me bro, at this point parsed[0] has to be a string
              const parsed: [
                string,
                (
                  | number[]
                  | Record<string, unknown>
                  | string[]
                  | boolean
                  | number
                  | string
                )
              ] = this.SUBRULE(this.objectItem)
              // eslint-disable-next-line prefer-destructuring, putout/putout
              temporaryObject[parsed[0]] = parsed[1]
            },
          },
          {
            ALT: () => {
              const type = this.CONSUME(identifierToken).image
              const name = this.CONSUME1(identifierToken).image
              const parsed: Record<string, unknown> = this.SUBRULE1(this.object)
              const clone: Record<string, unknown> = structuredClone(parsed)
              // eslint-disable-next-line no-underscore-dangle
              clone._type = type
              temporaryObject[name] = clone
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

export const productions: Record<string, Rule> = parser.getGAstProductions()

export function parseKetmar(text: string) {
  const lexResult = ketmarLexer.tokenize(text)
  parser.input = lexResult.tokens
  const cst = parser.ketmarMap()
  return {
    cst,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors,
    tokens: lexResult,
  }
}
