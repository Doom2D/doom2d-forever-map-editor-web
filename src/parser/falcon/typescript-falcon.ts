import readInt from '../../utility/read-int'
import readString from '../../utility/read-string'

import panelFlagsString from './constants/convert-panel-flags'
import panelTypesString from './constants/convert-panel-types'

function checkMapSignature(buffer: Readonly<ArrayBuffer>) {
  const view = new Uint8Array(buffer)
  const returnObject = {
    description: 'Checking map signature.',
    isSignatureValid: false,
    offset: 0,
  }
  if (view.length < 4) {
    returnObject.description = 'Map signature is not found.'
    returnObject.isSignatureValid = false
  } else if (
    String.fromCodePoint(view[0]) !== 'M' &&
    String.fromCodePoint(view[1]) !== 'A' &&
    String.fromCodePoint(view[2]) !== 'P'
  ) {
    returnObject.description = 'Map signature is invalid.'
    returnObject.isSignatureValid = false
  } else if (view[3] !== 1) {
    returnObject.description = 'Unsupported map version.'
    returnObject.isSignatureValid = false
  } else {
    returnObject.description = 'Map signature is valid.'
    returnObject.isSignatureValid = true
    returnObject.offset = 4
  }
  return returnObject
}

function parseMapInfo(buffer: Readonly<ArrayBuffer>, start: number) {
  const blockObject: Record<string, unknown> = {}
  const blockSize = 452
  const returnObject = {
    description: 'Parsing map info.',
    isBlockValid: true,
    offset: 0,
    blockObject,
  }
  let iOffset = 0
  iOffset += 1
  iOffset += 4
  const size = readInt(buffer, start + iOffset, 4)
  if (size !== blockSize) {
    returnObject.description = 'Invalid map info block size.'
    returnObject.isBlockValid = false
    return returnObject
  }
  iOffset += 4
  blockObject.name = readString(buffer, start + iOffset, 32, 'win1251')
  iOffset += 32
  blockObject.author = readString(buffer, start + iOffset, 32, 'win1251')
  iOffset += 32
  blockObject.description = readString(buffer, start + iOffset, 256, 'win1251')
  iOffset += 256
  blockObject.music = readString(buffer, start + iOffset, 64, 'win1251')
  iOffset += 64
  blockObject.sky = readString(buffer, start + iOffset, 64, 'win1251')
  iOffset += 64
  blockObject.size = [
    readInt(buffer, start + iOffset, 2),
    readInt(buffer, start + iOffset + 2, 2),
  ]
  iOffset += 4
  returnObject.offset += 1 + 4 + 4 + blockSize
  return returnObject
}

function parseTextureInfo(buffer: Readonly<ArrayBuffer>, start: number) {
  const blockObject: Record<string, unknown> = {}
  const blockSize = 65
  const returnObject = {
    description: 'Parsing panel info.',
    isBlockValid: true,
    offset: 0,
    blockObject,
  }
  let iOffset = 0
  iOffset += 1
  iOffset += 4
  const size = readInt(buffer, start + iOffset, 4)
  if (size % blockSize !== 0) {
    returnObject.description = 'Invalid map info block size.'
    returnObject.isBlockValid = false
    return returnObject
  }
  iOffset += 4
  let i = 0
  const n = size / blockSize
  while (i < n) {
    let eOffset = i * blockSize
    const textureObject: Record<string, unknown> = {}
    textureObject.path = readString(
      buffer,
      start + iOffset + eOffset,
      64,
      'win1251'
    )
    eOffset += 64
    textureObject.animated = readInt(buffer, start + iOffset + eOffset, 1)
    eOffset += 1
    textureObject._type = 'texture'
    returnObject.blockObject[`texture${i}`] = textureObject
    i += 1
  }
  iOffset += size
  returnObject.offset += 1 + 4 + 4 + size
  return returnObject
}

function parsePanelInfo(buffer: Readonly<ArrayBuffer>, start: number) {
  const blockObject: Record<string, unknown> = {}
  const blockSize = 18
  const returnObject = {
    description: 'Parsing panel info.',
    isBlockValid: true,
    offset: 0,
    blockObject,
  }
  returnObject.offset += 1
  returnObject.offset += 4
  const size = readInt(buffer, start + returnObject.offset, 4)
  if (size % blockSize !== 0) {
    returnObject.description = 'Invalid map info block size.'
    returnObject.isBlockValid = false
    return returnObject
  }
  returnObject.offset += 4

  let i = 0
  const n = size / blockSize
  while (i < n) {
    let eOffset = i * blockSize
    const panelObject: Record<string, unknown> = {}
    panelObject.position = [
      readInt(buffer, start + returnObject.offset + eOffset, 4),
      readInt(buffer, start + returnObject.offset + eOffset + 4, 4),
    ]
    eOffset += 8
    panelObject.size = [
      readInt(buffer, start + returnObject.offset + eOffset, 2),
      readInt(buffer, start + returnObject.offset + eOffset + 2, 2),
    ]
    eOffset += 4
    panelObject.texture = `texture${readInt(
      buffer,
      start + returnObject.offset + eOffset,
      2
    )}`
    eOffset += 2
    panelObject.type = panelTypesString(
      readInt(buffer, start + returnObject.offset + eOffset, 2)
    )
    eOffset += 2
    panelObject.alpha = readInt(
      buffer,
      start + returnObject.offset + eOffset,
      1
    )
    eOffset += 1
    panelObject.flags = panelFlagsString(
      readInt(buffer, start + returnObject.offset + eOffset, 1)
    )
    eOffset += 1
    panelObject._type = 'panel'
    returnObject.blockObject[`panel${i}`] = panelObject
    i += 1
  }
  returnObject.offset += 1 + 4 + 4 + size
  return returnObject
}

function checkFalcon(buffer: Readonly<ArrayBuffer>) {
  return checkMapSignature(buffer).isSignatureValid
}

export default function parseFalcon(buffer: Readonly<ArrayBuffer>) {
  const mapObject: Record<string, unknown> = {}
  const response = {
    description: 'Parsing falcon map.',
    isMapValid: false,
    mapObject,
  }
  let offset = 0

  const signatureResult = checkMapSignature(buffer)
  if (!signatureResult.isSignatureValid) {
    response.description = signatureResult.description
    response.isMapValid = false
    return response
  }
  offset += signatureResult.offset

  const infoResult = parseMapInfo(buffer, offset)
  if (!infoResult.isBlockValid) {
    response.description = infoResult.description
    response.isMapValid = false
  }
  offset += infoResult.offset
  Object.assign(response.mapObject, infoResult.blockObject)

  const textureResult = parseTextureInfo(buffer, offset)
  if (!textureResult.isBlockValid) {
    response.description = infoResult.description
    response.isMapValid = false
    return response
  }
  offset += textureResult.offset
  Object.assign(response.mapObject, textureResult.blockObject)

  const panelResult = parsePanelInfo(buffer, offset)
  if (!panelResult.isBlockValid) {
    response.description = infoResult.description
    response.isMapValid = false
    return response
  }
  offset += panelResult.offset
  Object.assign(response.mapObject, panelResult.blockObject)

  response.description = 'Successfully parsed falcon map.'
  response.isMapValid = true
  return response
}

export { parseFalcon, checkFalcon }
