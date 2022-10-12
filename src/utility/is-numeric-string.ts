function isNumeric(str: string) {
  return !Number.isNaN(str) && !Number.isNaN(Number.parseFloat(str))
}

function tryAsNumeric(str: string) {
  return isNumeric(str) ? Number(str) : str
}

export default isNumeric

export { isNumeric, tryAsNumeric }
