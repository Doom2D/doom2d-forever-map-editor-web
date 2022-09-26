export default function isObject(n: unknown) {
  return typeof n === 'object' && !Array.isArray(n) && n !== null
}
