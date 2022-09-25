export default function readString(
  buffer: Readonly<ArrayBuffer>,
  start: number,
  len: number,
  decode: 'utf8' | 'win1251'
) {
  const slice = new Uint8Array(buffer)
    .slice(start, start + len)
    .filter((element) => element !== 0)
  // eslint-disable-next-line unicorn/text-encoding-identifier-case
  let enc = new TextDecoder('utf-8')
  if (decode === 'win1251') {
    enc = new TextDecoder('windows-1251')
  }
  return enc.decode(slice)
}
