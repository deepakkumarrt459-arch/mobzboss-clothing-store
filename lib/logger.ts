export function log(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') console.log('[MobzBoss]', ...args)
}

export function warn(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') console.warn('[MobzBoss]', ...args)
}

export function error(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') console.error('[MobzBoss]', ...args)
}

export function debug(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') console.debug('[MobzBoss]', ...args)
}
