function clamp(n: unknown, min: number, max: number) {
  if (Number.isNaN(n) || !Number.isFinite(n)) return min
  if (typeof n === 'number') {
    if (n > max) return max
    if (n < min) return min
    return n
  }
  return min
}

export { clamp }
