import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const isBrowser = typeof window !== 'undefined'

console.log("API KEY =", process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log("PROJECT =", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

// Load Firebase configuration from environment variables provided in .env.local.
// These values are intentionally not hardcoded and should be managed securely.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (isBrowser) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  app = undefined as unknown as FirebaseApp
  auth = undefined as unknown as Auth
  db = undefined as unknown as Firestore
  storage = undefined as unknown as FirebaseStorage
}

export { app, auth, db, storage, isBrowser }
