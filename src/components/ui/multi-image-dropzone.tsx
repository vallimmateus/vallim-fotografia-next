'use client'

import { cn } from '@/lib/utils'
import { UploadCloudIcon, X } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'

const variants = {
  base: 'relative rounded-md flex p-6 justify-center items-center flex-col gap-5 cursor-pointer h-full w-full min-h-[150px] min-w-[200px] border border-dashed border-gray-300 transition-colors duration-200 ease-in-out',
  image: 'border-0 p-0 w-full h-full relative shadow-md bg-zinc-900 rounded-md',
  active: 'border-2',
  disabled:
    'border-gray-300 cursor-default pointer-events-none bg-opacity-30 bg-gray-700',
  accept: 'border border-blue-500 bg-blue-500 bg-opacity-10',
  reject: 'border border-red-700 bg-red-700 bg-opacity-10',
}

export type FileState = {
  file: File
  key: string
  progress: 'PENDING' | 'COMPLETE' | 'ERROR' | number
}

type InputProps = {
  className?: string
  value?: FileState[]
  onChange?: (files: FileState[]) => void | Promise<void>
  onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>
  disabled?: boolean
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'> & {
    customName?: 'uuid' | 'fileName'
    pathName?: string
  }
}

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`
  },
  fileInvalidType() {
    return 'Invalid file type.'
  },
  tooManyFiles(maxFiles: number) {
    return `You can only add ${maxFiles} file(s).`
  },
  fileNotSupported() {
    return 'The file is not supported.'
  },
}

const MultiImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, value, className, disabled, onChange, onFilesAdded },
    ref,
  ) => {
    const [customError, setCustomError] = React.useState<string>()
    const [totalFiles, setTotalFiles] = React.useState<number | null>(null)
    const [totalComplete, setTotalComplete] = React.useState<number | null>(
      null,
    )

    const imageUrls = React.useMemo(() => {
      if (value) {
        return value.map((fileState) => URL.createObjectURL(fileState.file))
      } else {
        return []
      }
    }, [value])

    React.useEffect(() => {
      if (value) {
        const total = value.length
        const complete = value.filter(
          (file) => file.progress === 'COMPLETE',
        ).length
        setTotalFiles(total > 0 ? total : null)
        setTotalComplete(complete > 0 ? complete : null)
      }
    }, [value])

    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      accept: { 'image/*': [] },
      disabled,
      onDrop: async (acceptedFiles) => {
        const files = acceptedFiles
        setCustomError(undefined)
        if (
          dropzoneOptions?.maxFiles &&
          (value?.length ?? 0) + files.length > dropzoneOptions.maxFiles
        ) {
          setCustomError(ERROR_MESSAGES.tooManyFiles(dropzoneOptions.maxFiles))
          return
        }
        if (files) {
          const addedFiles = files.map<FileState>((file) => ({
            file,
            key:
              (dropzoneOptions?.pathName
                ? dropzoneOptions.pathName.endsWith('/')
                  ? dropzoneOptions.pathName
                  : `${dropzoneOptions.pathName}/`
                : '') +
              (dropzoneOptions?.customName
                ? (() => {
                    switch (dropzoneOptions.customName) {
                      case 'uuid':
                        return uuidv4()
                      case 'fileName':
                        return file.name
                    }
                  })()
                : file.name),
            progress: 'PENDING',
          }))
          // eslint-disable-next-line no-void
          void onFilesAdded?.(addedFiles)
          // eslint-disable-next-line no-void
          void onChange?.([...(value ?? []), ...addedFiles])
        }
      },
      ...dropzoneOptions,
    })

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        cn(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className,
      ],
    )

    // error validation messages
    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0]
        if (errors[0]?.code === 'file-too-large') {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0)
        } else if (errors[0]?.code === 'file-invalid-type') {
          return ERROR_MESSAGES.fileInvalidType()
        } else if (errors[0]?.code === 'too-many-files') {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0)
        } else {
          return ERROR_MESSAGES.fileNotSupported()
        }
      }
      return undefined
    }, [fileRejections, dropzoneOptions])

    return (
      <div>
        {/* Dropzone */}
        {(!value ||
          value.length === 0 ||
          (dropzoneOptions?.maxFiles
            ? value.length < dropzoneOptions.maxFiles
            : true)) && (
          <div
            {...getRootProps({
              className: dropZoneClassName,
            })}
          >
            {/* Main File Input */}
            <input ref={ref} {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-xs text-gray-400">
              <UploadCloudIcon className="mb-2 h-7 w-7" />
              <p className="text-gray-400">drag & drop to upload</p>
              {totalFiles && totalFiles > 0 && (
                <p className="text-gray-400">
                  {totalComplete ? totalComplete.toString() : '0'}/
                  {totalFiles.toString()}
                </p>
              )}
              <Button className="mt-3" type="button" disabled={disabled}>
                select
              </Button>
            </div>
            {(customError || errorMessage) && (
              <div className="mt-3 text-xs text-red-500">
                {/* Error Text */}
                {customError ?? errorMessage}
              </div>
            )}
            {value && value.length > 0 && (
              <div className="z-10 grid w-full grid-cols-[repeat(1,1fr)] gap-2 sm:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)] xl:grid-cols-[repeat(4,1fr)]">
                {/* Images */}
                {value?.map(({ file, progress }, index) => (
                  <div
                    key={index}
                    className={variants.image + ' aspect-square'}
                  >
                    <Image
                      className="h-full w-full rounded-md object-contain"
                      src={imageUrls[index]}
                      alt={typeof file === 'string' ? file : file.name}
                      fill
                    />
                    {/* Progress Bar */}
                    {typeof progress === 'number' && (
                      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-md bg-black bg-opacity-70">
                        <CircleProgress progress={progress} />
                      </div>
                    )}
                    {/* Remove Image Icon */}
                    {imageUrls[index] &&
                      !disabled &&
                      !(typeof progress === 'number') && (
                        <div
                          className="group absolute right-0 top-0 z-20 -translate-y-1/4 translate-x-1/4 transform"
                          onClick={(e) => {
                            e.stopPropagation()
                            onChange?.(
                              value.filter((_, i) => i !== index) ?? [],
                            )
                          }}
                        >
                          <div className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-solid border-gray-400 bg-black transition-all duration-300 hover:h-6 hover:w-6">
                            <X
                              className="text-gray-400"
                              width={16}
                              height={16}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  },
)
MultiImageDropzone.displayName = 'MultiImageDropzone'

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        // base
        'inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        // color
        'border border-gray-600 text-gray-100 shadow hover:bg-gray-700 hover:text-gray-500',
        // size
        'h-6 rounded-md px-2 text-xs',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = 'Button'

function CircleProgress({ progress }: { progress: number }) {
  const strokeWidth = 10
  const radius = 50
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-16 w-16">
      <svg
        className="absolute left-0 top-0 -rotate-90 transform"
        width="100%"
        height="100%"
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${
          (radius + strokeWidth) * 2
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="text-gray-400"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
        />
        <circle
          className="text-white transition-all duration-300 ease-in-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={((100 - progress) / 100) * circumference}
          strokeLinecap="round"
          fill="none"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
        />
      </svg>
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center text-xs text-white">
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export { MultiImageDropzone }

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full border border-zinc-400">
      <div
        className="h-full bg-zinc-200 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

function formatFileSize(maxSize: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = maxSize
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
