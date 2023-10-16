import { IconButton, useLightboxState } from 'yet-another-react-lightbox'

import { MessagesSquare } from 'lucide-react'
import { useComments } from './CommentsContext'

export default function CommentsButton() {
  const { toggle } = useComments()

  const { currentSlide } = useLightboxState()

  return (
    <IconButton
      label="Comments"
      icon={MessagesSquare}
      onClick={toggle}
      disabled={!currentSlide}
    />
  )
}
