import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"

// Check if we have valid Firebase configuration
const hasValidFirebaseConfig = () => {
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  return requiredKeys.every((key) => {
    const value = process.env[key]
    return value && value !== "demo-key" && value !== "demo-project" && value !== "demo-project.firebaseapp.com"
  })
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

// Only initialize Firebase if we have valid configuration
if (hasValidFirebaseConfig()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    auth = getAuth(app)
    console.log("Firebase initialized successfully")
  } catch (error) {
    console.warn("Failed to initialize Firebase:", error)
    app = null
    db = null
    auth = null
  }
} else {
  console.log("Using mock data - Firebase not configured")
}

export { db, auth, app }
export const isFirebaseAvailable = () => db !== null && auth !== null
