function pathConstructed(
  dirs: Readonly<string[]>,
  basename: string,
  slash: string
) {
  return dirs.length === 0 || dirs.at(0) === ''
    ? basename
    : dirs.join(slash) + slash + basename
}

export default pathConstructed
