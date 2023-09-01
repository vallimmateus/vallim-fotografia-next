import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

type LiveSearchProps<T> = {
  results?: T[]
  renderItem(item: T): JSX.Element
  onChange: React.ChangeEventHandler
  onSelect?: (item: T) => void
  value?: string
}

export const LiveSearch = <T extends Record<string, unknown>>({
  results = [],
  renderItem,
  onChange,
  onSelect,
  value,
}: LiveSearchProps<T>): JSX.Element => {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const resultContainer = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [showResults, setShowResults] = useState(false)
  const [defaultValue, setDefaultValue] = useState('')
  const [showSearchBar, setShowSearchBar] = useState(false)

  const resetSearchComplete = useCallback(() => {
    setFocusedIndex(-1)
    setShowResults(false)
    setShowSearchBar(false)
    setDefaultValue('')
  }, [])

  const handleSelection = (selectedIndex: number) => {
    const selectedItem = results[selectedIndex]
    if (!selectedItem) return resetSearchComplete()
    onSelect && onSelect(selectedItem)
    resetSearchComplete()
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    let nextIndexCount = 0
    const { key } = e

    if (key === 'ArrowDown') {
      e.preventDefault()
      nextIndexCount = (focusedIndex + 1) % results.length
    } else if (key === 'ArrowUp') {
      e.preventDefault()
      nextIndexCount = (focusedIndex + results.length - 1) % results.length
    } else if (key === 'Escape') {
      e.preventDefault()
      resetSearchComplete()
    } else if (key === 'Enter') {
      e.preventDefault()
      handleSelection(focusedIndex)
    }
    setFocusedIndex(nextIndexCount)
  }

  type changeHandler = React.ChangeEventHandler<HTMLInputElement>
  const handleChange: changeHandler = (e) => {
    setDefaultValue(e.target.value)
    onChange && onChange(e)
  }

  useEffect(() => {
    if (!resultContainer.current) {
      return
    }

    resultContainer.current.scrollIntoView({
      block: 'center',
    })
  }, [focusedIndex])

  useEffect(() => {
    if (results.length > 0 && !showResults) {
      setShowResults(true)
    }
    if (results.length <= 0) {
      setShowResults(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

  useEffect(() => {
    if (value) setDefaultValue(value)
  }, [value])

  return (
    <div
      className="relative"
      tabIndex={1}
      onBlur={resetSearchComplete}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (!showSearchBar) setShowSearchBar(true)
        if (searchRef.current) searchRef.current.focus()
      }}
    >
      <div
        className={clsx('relative mr-1 flex h-8 items-center transition-all', {
          'w-[300px] text-zinc-100': showSearchBar,
          'w-[100px] text-zinc-400': !showSearchBar,
        })}
      >
        <input
          ref={searchRef}
          value={defaultValue}
          onChange={handleChange}
          type="text"
          className={clsx(
            'h-full w-full items-center rounded-full border-2 bg-zinc-800 px-3 py-1 pl-8 text-sm text-zinc-200 outline-none transition-all focus:border-zinc-600',
            {
              'border-zinc-900 placeholder:text-zinc-500': showSearchBar,
              'border-zinc-800 placeholder:text-zinc-400': !showSearchBar,
            },
          )}
          placeholder="Search..."
        />
        <div>
          <svg
            className="absolute left-3 top-0 h-8 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
      </div>

      {/* Search results container */}
      {showResults && (
        <div className="absolute mt-1 max-h-48 w-full overflow-y-auto rounded-bl-md rounded-br-md bg-zinc-800 p-2 text-sm shadow-lg">
          {results.map((item, idx) => {
            return (
              <div
                key={idx}
                ref={idx === focusedIndex ? resultContainer : null}
                onMouseDown={() => handleSelection(idx)}
                data-focused={idx === focusedIndex}
                className="cursor-pointer rounded-md p-2 hover:bg-white hover:bg-opacity-10 data-[focused=true]:bg-white data-[focused=true]:bg-opacity-10"
              >
                {renderItem(item)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
