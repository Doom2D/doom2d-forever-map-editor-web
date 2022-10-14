export default function isObject(n: unknown): n is Record<string, unknown> {
  return typeof n === 'object' && !Array.isArray(n) && n !== null
}
