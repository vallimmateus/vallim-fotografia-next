// app/page.tsx ou app/faces/page.tsx

import React from 'react'
import { getAllImages } from './actions'
import { FaceDetectionPhoto } from './components/detection-photo'

export default async function FaceDetectionPage() {
  const event = await getAllImages()
  return (
    <div className="flex flex-row flex-wrap items-start justify-center gap-4 p-4">
      {event?.photos.map((photo) => (
        <FaceDetectionPhoto key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
