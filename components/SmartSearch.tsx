'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { searchProducts, getSearchSuggestions } from '@/services/searchService'
import type { Product } from '@/types/product'

interface SmartSearchProps {
  onSearch: (products: Product[]) => void
  onSearchChange?: (query: string) => void
}

export default function SmartSearch({ onSearch, onSearchChange }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searching, setSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { history, addSearch } = useSearchHistory()

  // Load suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const loadSuggestions = async () => {
      const sug = await getSearchSuggestions(query, 8)
      setSuggestions(sug)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    }

    const timer = setTimeout(loadSuggestions, 300)
    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setShowSuggestions(false)

    try {
      const results = await searchProducts([searchQuery])
      addSearch(searchQuery)
      onSearch(results)
    } catch (error) {
      console.error('Search error:', error)
      onSearch([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = async () => {
    await performSearch(query)
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    await performSearch(suggestion)
  }

  const handleHistoryClick = async (search: string) => {
    setQuery(search)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    await performSearch(search)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions && suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
      return
    }

    const displayItems = suggestions.length > 0 ? suggestions : history

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < displayItems.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(displayItems[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
      default:
        break
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, category, brand, or price..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearchChange?.(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 || (query.trim() && history.length > 0)) {
              setShowSuggestions(true)
            }
          }}
          className="w-full rounded-full border border-[#7A5C3E]/20 bg-[#111111] px-6 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#F5F5F5]/50 hover:border-[#C9A227] focus:border-[#C9A227]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#C9A227] px-4 py-2 text-xs font-semibold text-[#111111] transition hover:bg-[#E0C46D] disabled:opacity-50"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || history.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-[#7A5C3E]/20 bg-[#0b0b0b] shadow-lg">
          {suggestions.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#C9A227]">Suggestions</div>
              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-6 py-2 text-left text-sm transition ${
                      selectedIndex === index
                        ? 'bg-[#C9A227]/20 text-[#C9A227]'
                        : 'text-[#F5F5F5] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {suggestions.length === 0 && history.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#C9A227]">Recent Searches</div>
              <div className="max-h-40 overflow-y-auto">
                {history.map((search, index) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleHistoryClick(search)}
                    className={`w-full px-6 py-2 text-left text-sm transition ${
                      selectedIndex === index
                        ? 'bg-[#C9A227]/20 text-[#C9A227]'
                        : 'text-[#F5F5F5]/70 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
