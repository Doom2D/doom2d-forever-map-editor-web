// eslint-disable-next-line etc/no-t
function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0
  const callable = (...args: unknown[]) => {
    clearTimeout(h)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    h = setTimeout(() => cb(...args), wait)
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return callable as unknown as T
}

export {debounce}

