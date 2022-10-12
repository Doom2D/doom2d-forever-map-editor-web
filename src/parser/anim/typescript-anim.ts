/* eslint-disable regexp/require-unicode-regexp */
/* eslint-disable require-unicode-regexp */
import { createToken, Lexer, EmbeddedActionsParser } from 'chevrotain'

import { tryAsNumeric } from '../../utility/is-numeric-string'

const newLineToken = createToken({
  name: 'New Lines',
  pattern: /[\n\r ]+/,
  group: Lexer.SKIPPED,
})

const whitespaceToken = createToken({
  name: 'Whitespace',
  pattern: /[\t ]+/,
  group: Lexer.SKIPPED,
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

const equalsToken = createToken({
  name: 'Equals',
  pattern: /=/,
})
const identifierToken = createToken({
  name: 'Id',
  pattern: /[\w.]+/,
})

const ketmarTokens = [
  comment,
  multilineComment,
  whitespaceToken,
  newLineToken,
  equalsToken,
  identifierToken,
]

const lexer = new Lexer(ketmarTokens)

class KetmarParserTypeScript extends EmbeddedActionsParser {
  public readonly animConfig = this.RULE('config', () => {
    const response: Record<string, unknown> = {}
    this.MANY({
      DEF: () => {
        const x = this.SUBRULE(this.animLine)
        response[x[0]] = x[1]
      },
    })
    return response
  })

  private readonly animLine = this.RULE('line', () => {
    const id = this.CONSUME(identifierToken)
    this.CONSUME(equalsToken)
    const id1 = this.CONSUME1(identifierToken)
    return [tryAsNumeric(id.image), tryAsNumeric(id1.image)]
  })

  public constructor() {
    super(ketmarTokens, {
      recoveryEnabled: true,
    })
    this.performSelfAnalysis()
  }
}

const parser = new KetmarParserTypeScript()

export default function parseAnim(text: string) {
  const lex = lexer.tokenize(text)
  parser.input = lex.tokens
  return parser.animConfig()
}
