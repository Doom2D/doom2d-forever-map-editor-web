function withoutExtension(filename: string) {
  const v = {
    ext: '',
    basename: '',
  }
  const i = filename.lastIndexOf('.')
  if (i === -1) {
    v.basename = filename
  } else {
    v.ext = filename.slice(i + 1)
    v.basename = filename.slice(0, i)
  }
  return v
}

export default withoutExtension
