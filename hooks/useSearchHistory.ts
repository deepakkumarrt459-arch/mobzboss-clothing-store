import { useState } from 'react'

const SEARCH_HISTORY_STORAGE_KEY = 'mobzboss_search_history'
const MAX_SEARCH_HISTORY = 10

function getLocalSearchHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveLocalSearchHistory(searches: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searches.slice(0, MAX_SEARCH_HISTORY)))
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => getLocalSearchHistory())

  const addSearch = (query: string) => {
    if (!query.trim()) return

    const updated = [query, ...history.filter((h) => h !== query)].slice(0, MAX_SEARCH_HISTORY)
    saveLocalSearchHistory(updated)
    setHistory(updated)
  }

  const removeSearch = (query: string) => {
    const updated = history.filter((h) => h !== query)
    saveLocalSearchHistory(updated)
    setHistory(updated)
  }

  const clearHistory = () => {
    saveLocalSearchHistory([])
    setHistory([])
  }

  return { history, addSearch, removeSearch, clearHistory }
}
