import sharp, { type Region } from 'sharp'

type SharpImage = ReturnType<typeof sharp>

/**
 * Detects whether an image is greyscale.
 *
 * Useful to know whether it's safe to compress an image down to 1 channel from 3 channels
 */
export const isSharpImageGreyscale = async (
  sharpImage: SharpImage
): Promise<boolean> => {
  const greyscaleThreshold = 1

  try {
    // Get image metadata first
    const metadata = await sharpImage.metadata()

    // If image has only one channel, it's definitely grayscale
    if (metadata.channels === 1) {
      return true
    }

    // For images with multiple channels, we need to check if all channels are identical
    const { data, info } = await sharpImage
      .raw()
      .toBuffer({ resolveWithObject: true })

    const width = info.width
    const height = info.height

    // Compare RGB values across all pixels, sequentially...
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * metadata.channels
        const r = data[offset]
        const g = data[offset + 1]
        const b = data[offset + 2]

        // If RGB values differ by more than a tiny threshold (accounting for potential compression artifacts)
        if (
          Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r)) >
          greyscaleThreshold
        ) {
          return false
        }
      }
    }

    return true
  } catch (error: unknown) {
    console.error(error)
    throw new Error(
      `Failed to check if image is grayscale: ${error && typeof error === 'object' && 'message' in error
        ? error.message
        : error
      }`
    )
  }
}

type CompressImageToPngProps = {
  sharpImage: SharpImage,
  metadata: sharp.Metadata,
  mode: 'compress' | 'compress-greyscale',
  widthPx: number,
  heightPx: number,
  debugPrefix: string
}

export const compressImageToPng = async ({
  sharpImage,
  metadata,
  mode,
  widthPx,
  heightPx,
  debugPrefix,
}: CompressImageToPngProps): Promise<Buffer | undefined> => {
  console.log({
    debugPrefix,
    widthPx,
    heightPx,
    metadata_width: metadata.width,
    metadata_height: metadata.height,
  })
  const [width, height] = [
    Math.min(widthPx, metadata.width),
    Math.min(heightPx, metadata.height)
  ].sort() // assuming portrait layout so width < height

  const extractOptions: Region = { left: 0, top: 0, width, height }
  const compressionLevel = 9

  try {
    switch (mode) {
      case 'compress':
        const bufferCompress = await sharpImage
          // .autoOrient() // auto-rotates if EXIF data etc say it should
          .keepExif()
          .extract(extractOptions)
          .png({ compressionLevel })
          .toBuffer()
        return bufferCompress
      case 'compress-greyscale':
        const bufferCompressGrayscale = await sharpImage
          // .autoOrient() // auto-rotates if EXIF data etc say it should
          .greyscale(true)
          .extract(extractOptions)
          .png({
            compressionLevel,
            colours:
              // 64 greys oughta be enough for anyone
              64
          })
          .toBuffer()
        return bufferCompressGrayscale
    }
  } catch (e) {
    console.error('[UNPDF_ERROR]',
      debugPrefix,
      JSON.stringify(extractOptions),
      `${width}x${height}`,
      ' vs ',
      `${metadata.width}x${metadata.height}`,
      e
    )
    throw e
  }
}
