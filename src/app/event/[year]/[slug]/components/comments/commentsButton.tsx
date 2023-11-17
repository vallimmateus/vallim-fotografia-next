import { useCommentsContext } from "./commentsContext"

import { MessagesSquare } from "lucide-react"
import { IconButton, useLightboxState } from "yet-another-react-lightbox"

export default function CommentsButton() {
  const { toggle } = useCommentsContext()

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
