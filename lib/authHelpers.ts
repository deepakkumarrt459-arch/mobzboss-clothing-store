export type PostLoginAction = { action: string; payload?: Record<string, unknown> }

export function ensureAuth(router: { push: (url: string) => void }, user: { uid?: string } | null, postLoginAction?: PostLoginAction) {
  if (user && user.uid) return true

  try {
    if (typeof window !== 'undefined' && postLoginAction) {
      sessionStorage.setItem('postLoginAction', JSON.stringify(postLoginAction))
    }
  } catch {
    // ignore
  }

  const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
  router.push(`/login?next=${encodeURIComponent(next)}`)
  return false
}

export function consumePostLoginAction() {
  try {
    if (typeof window === 'undefined') return null
    const raw = sessionStorage.getItem('postLoginAction')
    if (!raw) return null
    sessionStorage.removeItem('postLoginAction')
    return JSON.parse(raw) as PostLoginAction
  } catch {
    return null
  }
}
