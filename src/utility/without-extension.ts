function withoutExtension(filename: string) {
  return (
    filename.slice(filename.lastIndexOf('.') + 1, filename.length) || filename
  )
}

export default withoutExtension
