export default function readInt(
  buffer: Readonly<ArrayBuffer>,
  start: number,
  len: number
) {
  const view = new Uint8Array(buffer)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let numbers: number[] = Array(len) as number[]
  if (len % 4 !== 0) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pad: number[] = Array(4 - (len % 4)).fill(0)
    numbers = numbers.concat(pad)
  }
  for (let x = 0; x < len; x += 1) {
    if (view[start + x]) {
      numbers[x] = view[start + x]
    } else {
      numbers[x] = 0
    }
  }
  const dataView = new DataView(Uint8Array.from(numbers).buffer)
  return dataView.getInt32(0, true)
}
