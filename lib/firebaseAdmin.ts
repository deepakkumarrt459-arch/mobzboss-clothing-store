import admin from 'firebase-admin'

let initialized = false
let adminDbRef: admin.firestore.Firestore | null = null

function tryParseCredentials(credsJson: string | undefined): Record<string, unknown> | null {
  if (!credsJson) return null

  try {
    const parsed = JSON.parse(credsJson)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function initAdmin() {
  if (initialized) return

  const credsJson = process.env.FIREBASE_ADMIN_CREDENTIALS || process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  const parsedCredentials = tryParseCredentials(typeof credsJson === 'string' ? credsJson : undefined)

  if (parsedCredentials) {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(parsedCredentials as admin.ServiceAccount) })
    }
    adminDbRef = admin.firestore()
    initialized = true
    return
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY

  if (privateKey) privateKey = privateKey.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    // Do not throw here to avoid breaking builds; let callers decide when to require credentials.
    return
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey } as admin.ServiceAccount),
    })
  }

  adminDbRef = admin.firestore()
  initialized = true
}

export function getAdminDb() {
  if (!initialized || !adminDbRef) {
    throw new Error('Firebase Admin SDK is not initialized. Ensure admin credentials are provided (FIREBASE_ADMIN_CREDENTIALS or FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY).')
  }
  return adminDbRef
}

export async function verifyFirebaseIdToken(idToken: string) {
  if (!initialized) {
    throw new Error('Firebase Admin SDK is not initialized. Ensure admin credentials are provided.')
  }

  return admin.auth().verifyIdToken(idToken)
}

export async function verifyAdminUser(idToken: string): Promise<string> {
  const decodedToken = await verifyFirebaseIdToken(idToken)
  const uid = decodedToken.uid
  const firestore = getAdminDb()
  const userDoc = await firestore.doc(`users/${uid}`).get()
  const userData = userDoc.data() as Record<string, unknown> | undefined

  if (!userDoc.exists || typeof userData?.role !== 'string' || userData.role !== 'admin') {
    throw new Error('Unauthorized admin access')
  }

  return uid
}

export { admin }
