function isBufferBinary(src: Readonly<ArrayBuffer>) {
  const charsToCheck = 400
  const slice = new Uint8Array(src).slice(0, charsToCheck)

  // check for NUL characters
  return slice.includes(0)
}

export default isBufferBinary
