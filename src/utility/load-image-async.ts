/* eslint-disable promise/avoid-new */

async function loadImage(src: Readonly<ArrayBuffer>) {
  const imageLoad = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const blob = new Blob([src])
    const url = window.URL.createObjectURL(blob)
    image.src = url
    image.addEventListener('load', () => {
      resolve(image)
    })
    image.addEventListener('error', () => {
      reject(new Error('Error loading image'))
    })
  })
  return await imageLoad
}

export default loadImage
