import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (!nextUser) setAccessToken(null);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? null;
      setAccessToken(token);
      return token;
    } catch (err) {
      setAuthError(err.message || "Sign-in failed.");
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, accessToken, authError, signInWithGoogle, signOut }),
    [user, authLoading, accessToken, authError, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
