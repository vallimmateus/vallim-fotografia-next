'use client'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CheckCheckIcon, ClipboardIcon } from 'lucide-react'
import { useState } from 'react'

type CopyCommentType = {
  text: string
}

export default function CopyComment({ text }: CopyCommentType) {
  const [textCopied, setTextCopied] = useState(false)
  return (
    <TooltipProvider>
      <Tooltip defaultOpen={textCopied}>
        <TooltipTrigger className="h-full w-full" asChild>
          <div
            className="group relative h-full w-full cursor-pointer"
            onClick={async () => {
              setTextCopied(true)
              await navigator.clipboard.writeText(text)
              setTimeout(() => {
                setTextCopied(false)
              }, 5000)
            }}
          >
            <Textarea
              className="h-full w-full cursor-pointer p-1.5 text-zinc-200"
              readOnly
            >
              {text}
            </Textarea>
            {textCopied ? (
              <CheckCheckIcon
                className="absolute bottom-2 right-2 text-green-400"
                size={16}
              />
            ) : (
              <ClipboardIcon
                className="absolute bottom-2 right-2 text-zinc-300 group-hover:text-zinc-100"
                size={16}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {textCopied ? 'Copiado!' : 'Clique para copiar'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
