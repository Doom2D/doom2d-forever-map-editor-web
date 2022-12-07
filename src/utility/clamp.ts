function clamp(n: unknown, min: number | undefined, max: number | undefined) {
  if (typeof n === 'number') {
    if (Number.isNaN(n) || !Number.isFinite(n))
      return min ?? Number.MIN_SAFE_INTEGER
    if (max !== undefined && n > max) return max
    if (min !== undefined && n < min) return min
    return n
  }
  return min ?? Number.MIN_SAFE_INTEGER
}

export { clamp }
