import pathConstructed from '../../../utility/construct-path'
import withoutExtension from '../../../utility/without-extension'

class ResourcePath {
  public constructor(
    private readonly src: Readonly<string[]>,
    private readonly basename: string,
    private readonly fileSrc: string
  ) {}

  public getParent() {
    return this.src
  }

  public getBaseName() {
    return this.basename
  }

  public asThisEditorPath(withSource = true) {
    let str = ''
    str += withSource ? `[${this.fileSrc.toLocaleLowerCase()}]` : `[]`
    str += pathConstructed(
      this.src.map((x) => x.toLocaleLowerCase()),
      withoutExtension(this.basename).basename.toLocaleLowerCase(),
      '/'
    )
    return str
  }

  public asGamePath(root = true) {
    let str = ''
    if (!root) {
      str += this.fileSrc.toLocaleLowerCase()
    }
    str += ':'
    str += pathConstructed(
      this.src.map((x) => x.toLocaleLowerCase()),
      withoutExtension(this.basename).basename.toLocaleLowerCase(),
      '\\'
    )
    return str
  }

  public asRegularPath(withSource = false) {
    return withSource
      ? `${this.fileSrc.toLocaleLowerCase()}/${pathConstructed(
          this.src.map((x) => x.toLocaleLowerCase()),
          withoutExtension(this.basename).basename.toLocaleLowerCase(),
          '/'
        )}`
      : pathConstructed(
          this.src.map((x) => x.toLocaleLowerCase()),
          withoutExtension(this.basename).basename.toLocaleLowerCase(),
          '/'
        )
  }
}

export default ResourcePath
