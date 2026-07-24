import { NextResponse } from 'next/server'
import { error as logError } from './logger'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Create a success response with optional data
 */
export function successResponse<T>(data?: T, message = 'Success'): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status: 200 }
  )
}

/**
 * Create an error response with proper status code
 * Hides sensitive details in production
 */
export function errorResponse(
  message: string,
  status = 400,
  error?: unknown
): NextResponse<ApiResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const details = isDevelopment && error instanceof Error ? error.message : undefined

  return NextResponse.json(
    {
      success: false,
      message,
      ...(isDevelopment && details && { error: details }),
    },
    { status }
  )
}

/**
 * Create a validation error response
 */
export function validationError(message: string, status = 400): NextResponse<ApiResponse> {
  return errorResponse(message, status)
}

/**
 * Create an authentication error response
 */
export function authError(message = 'Authentication required'): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

/**
 * Create an authorization error response
 */
export function authorizationError(message = 'Unauthorized access'): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

/**
 * Create a not found error response
 */
export function notFoundError(message = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, 404)
}

/**
 * Create a server error response
 */
export function serverError(
  message = 'Internal server error',
  error?: unknown
): NextResponse<ApiResponse> {
  // Log actual error for debugging
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    logError('[API Error]', error.message)
  }

  return errorResponse(message, 500, error)
}

/**
 * Safely parse JSON request body
 */
export async function parseRequestBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/**
 * Get required field from object
 */
export function getRequiredField<T>(
  obj: Record<string, unknown>,
  field: string,
  type: 'string' | 'number' | 'boolean' = 'string'
): T | null {
  const value = obj[field]

  if (value === undefined || value === null) return null

  if (type === 'string' && typeof value === 'string') return value as T
  if (type === 'number' && typeof value === 'number') return value as T
  if (type === 'boolean' && typeof value === 'boolean') return value as T

  return null
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000) // Limit length
}
