import { useCommentsContext } from './commentsContext'

import { LucideProps, MessagesSquare } from 'lucide-react'
import { IconButton, useLightboxState } from 'yet-another-react-lightbox'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const CommentsIcon = forwardRef<SVGSVGElement, LucideProps>(
  function CommentsIcon(props, ref) {
    const { className, ...rest } = props

    return (
      <svg viewBox="0 0 28 28" className="h-7 w-7">
        <defs>
          <linearGradient id="eelnglI" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F570B7" />
            <stop offset="100%" stopColor="#FFBC75" />
          </linearGradient>
          <linearGradient id="eelnglF" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC1187" />
            <stop offset="100%" stopColor="#FF8D10" />
          </linearGradient>
        </defs>
        <MessagesSquare
          size={28}
          className={cn(
            'stroke-[url(#eelnglI)] group-hover:stroke-[url(#eelnglF)]',
            className,
          )}
          ref={ref as React.RefObject<SVGSVGElement>}
          {...rest}
        />
      </svg>
    )
  },
)

export default function CommentsButton() {
  const { toggle } = useCommentsContext()

  const { currentSlide } = useLightboxState()

  return (
    <IconButton
      className="group"
      label="Comments"
      icon={CommentsIcon}
      onClick={toggle}
      disabled={!currentSlide}
    />
  )
}
