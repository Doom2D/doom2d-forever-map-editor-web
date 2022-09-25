export default function bitFlagsToString(
  x: number,
  f: Readonly<Record<string, number>>
) {
  const arr: string[] = []
  for (const [key, value] of Object.entries(f)) {
    if (x & value) {
      arr.push(key)
    }
  }
  if (arr.length === 0) {
    arr.push(Object.keys(f)[0])
  }
  return arr
}
