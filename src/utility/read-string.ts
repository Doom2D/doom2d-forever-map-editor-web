export default function readString(
  buffer: Readonly<ArrayBuffer>,
  start: number,
  len: number | undefined,
  decode: 'utf8' | 'win1251'
) {
  const view = new Uint8Array(buffer)
  const slice = view
    .slice(start, start + (len ?? view.length))
    .filter((element) => element !== 0)
  // eslint-disable-next-line unicorn/text-encoding-identifier-case
  let enc = new TextDecoder('utf-8')
  if (decode === 'win1251') {
    enc = new TextDecoder('windows-1251')
  }
  return enc.decode(slice)
}
