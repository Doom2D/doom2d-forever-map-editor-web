const enc = new TextEncoder()
function encodeString(s: string) {
  return enc.encode(s)
}

export default encodeString
