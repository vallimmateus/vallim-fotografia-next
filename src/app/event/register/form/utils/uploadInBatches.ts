const BATCH_SIZE = 5

export async function uploadInBatches(
  photos: {
    key: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file?: any
  }[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadFn: (photo: { key: string; file?: any }) => Promise<void>,
) {
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(uploadFn))
  }
}
