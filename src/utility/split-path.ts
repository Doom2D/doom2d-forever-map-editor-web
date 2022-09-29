function pathSplit(x: string) {
  const obj = {
    directory: '',
    fileName: '',
  }
  const pathStrSplit = x.split('/')
  obj.fileName = pathStrSplit.pop() ?? ''
  obj.directory = pathStrSplit.join('/')
  return obj
}

export default pathSplit
