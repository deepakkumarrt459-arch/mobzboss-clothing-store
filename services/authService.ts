import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export async function login(email: string, password: string, rememberMe = true): Promise<User> {
  const a = auth
  if (!a) throw new Error('Firebase auth not initialized')

  await setPersistence(a, rememberMe ? browserLocalPersistence : browserSessionPersistence)
  const result = await signInWithEmailAndPassword(a, email, password)
  return result.user
}

export async function register(name: string, email: string, password: string): Promise<User> {
  const a = auth
  if (!a) throw new Error('Firebase auth not initialized')

  const result = await createUserWithEmailAndPassword(a, email, password)
  return result.user
}

export async function resetPassword(email: string): Promise<void> {
  const a = auth
  if (!a) throw new Error('Firebase auth not initialized')

  await sendPasswordResetEmail(a, email)
}

export async function logout(): Promise<void> {
  const a = auth
  if (!a) throw new Error('Firebase auth not initialized')

  await signOut(a)
}

export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null
}
