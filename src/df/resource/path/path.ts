import pathConstructed from '../../../utility/construct-path'

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

  public asThisEditorPath() {
    let str = ''
    str += `[${this.fileSrc}]`
    str += pathConstructed(this.src, this.basename, '\\')
    return str
  }

  public asGamePath(root = true) {
    let str = ''
    if (!root) {
      str += this.fileSrc
    }
    str += ':'
    str += pathConstructed(this.src, this.basename, '\\')
    return str
  }
}

export default ResourcePath
