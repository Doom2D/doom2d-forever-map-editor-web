function pathSplit(x: string) {
  const obj = {
    directory: '',
    fileName: '',
    directories: ['']
  }
  const pathStrSplit = x.split('/')
  obj.fileName = pathStrSplit.pop() ?? ''
  obj.directories = pathStrSplit
  obj.directory = pathStrSplit.join('/')
  return obj
}

export default pathSplit
