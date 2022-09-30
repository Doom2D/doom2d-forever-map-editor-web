import readInt from '../../../utility/read-int'
import readString from '../../../utility/read-string'

function getWadRecordCount(buffer: Readonly<ArrayBuffer>) {
  return readInt(buffer, 6, 2)
}

interface WadRecord {
  memAddress: number
  memLength: number
  type: 'parent' | 'resource'
  parentSection: string
  name: string
}

function wadAsJson(arr: Readonly<ArrayBuffer>) {
  const wadObject: Record<string, WadRecord> = {}
  const returnObject = {
    description: 'Parsing WAD...',
    isValid: false,
    wadObject,
  }
  const view = new Uint8Array(arr)
  if (readString(arr, 0, 5, 'win1251') !== 'DFWAD') {
    returnObject.description = 'Invalid WAD signature!'
    returnObject.isValid = false
    return returnObject
  }
  if (view[5] !== 1) {
    returnObject.description = 'Unsupported WAD version!'
    returnObject.isValid = false
    return returnObject
  }
  if (view.length < 8) {
    returnObject.description = 'File is too small!'
    returnObject.isValid = false
    return returnObject
  }
  const recordCount = getWadRecordCount(arr)
  let offset = 8
  let parentSection = ''
  for (let i = 0; i < recordCount; i += 1) {
    const structName = readString(arr, offset, 16, 'win1251')
    const memAddress = readInt(arr, offset + 16, 4)
    const memLength = readInt(arr, offset + 16 + 4, 4)
    let type: 'parent' | 'resource' = 'resource'
    if (memLength === 0 && memAddress === 0) {
      parentSection = structName
    }
    if (memAddress === 0) {
      type = 'parent'
    }
    wadObject[type + i.toString()] = {
      memAddress,
      memLength,
      type,
      parentSection: parentSection !== structName ? parentSection : '',
      name: structName,
    }
    offset += 24
  }
  returnObject.description = 'Successfully parsed WAD.'
  returnObject.isValid = true
  return returnObject
}

export { wadAsJson, type WadRecord }
