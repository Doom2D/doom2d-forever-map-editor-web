function capitalize(s: string) {
  return (s && s[0].toUpperCase() + s.slice(1)) || ''
}

export default capitalize
