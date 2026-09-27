import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, phoneToEmail } from '../firebase';
import { Phone, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  isDarkMode?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isDarkMode = false }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUserToFirestore = async (
    uid: string,
    phoneNumber: string,
    displayName: string,
    email: string,
    photoURL?: string
  ) => {
    const userRef = doc(db, 'users', uid);
    const existingSnap = await getDoc(userRef);

    const dataToSave = {
      uid,
      phoneNumber: phoneNumber || existingSnap.data()?.phoneNumber || '',
      displayName: displayName || existingSnap.data()?.displayName || phoneNumber || 'WhatsApp User',
      email: email || existingSnap.data()?.email || '',
      photoURL:
        photoURL ||
        existingSnap.data()?.photoURL ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || uid)}`,
      about: existingSnap.data()?.about || 'Hey there! I am using WhatsApp.',
      isOnline: true,
      lastSeen: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      ...(existingSnap.exists() ? {} : { createdAt: serverTimestamp() }),
    };

    await setDoc(userRef, dataToSave, { merge: true });
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const email = phoneToEmail(cleanPhone);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, {
          displayName: name.trim(),
        });
        await saveUserToFirestore(
          userCred.user.uid,
          cleanPhone,
          name.trim(),
          email
        );
      } else {
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          await saveUserToFirestore(
            userCred.user.uid,
            cleanPhone,
            userCred.user.displayName || cleanPhone,
            email
          );
        } catch (signInErr: any) {
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            // Check if user wants to create account
            setError('Account not found with this phone number. Switch to "Create Account" below to register.');
          } else if (signInErr.code === 'auth/wrong-password') {
            setError('Incorrect password. Please try again.');
          } else {
            setError(signInErr.message || 'Failed to sign in.');
          }
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This phone number is already registered. Please log in instead.');
      } else {
        setError(err.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(
        userCred.user.uid,
        userCred.user.phoneNumber || '',
        userCred.user.displayName || 'Google User',
        userCred.user.email || '',
        userCred.user.photoURL || undefined
      );
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors ${
        isDarkMode ? 'bg-[#111b21] text-white' : 'bg-[#EFEAE2] text-gray-900'
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden border transition-colors ${
          isDarkMode
            ? 'bg-[#1f2c34] border-white/10'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Top Header */}
        <div className="bg-[#075E54] p-6 text-white text-center select-none">
          <div className="w-16 h-16 rounded-full bg-white/15 mx-auto flex items-center justify-center mb-3">
            <svg
              className="w-10 h-10 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92zm0 18.16c-1.52 0-3-.41-4.31-1.18l-.31-.18-3.19.84.85-3.11-.2-.32a8.214 8.214 0 01-1.26-4.4c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.51-6.18c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.47-.01c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">WhatsApp</h1>
          <p className="text-xs text-white/80 mt-1">
            Real-time chat messenger on Firebase
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-gray-200 dark:border-white/10 text-sm font-semibold select-none">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              !isSignUp
                ? 'text-[#00a884] border-b-2 border-[#00a884] bg-emerald-50/20 dark:bg-white/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              isSignUp
                ? 'text-[#00a884] border-b-2 border-[#00a884] bg-emerald-50/20 dark:bg-white/5'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePhoneAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required={isSignUp}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555 123 4567"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Enter your phone number to sign in or register
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-sm outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#00a884] hover:bg-[#009374] text-white font-semibold text-sm shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create WhatsApp Account' : 'Sign In with Phone'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs uppercase text-gray-400 font-semibold">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 text-center text-[11px] text-gray-500 dark:text-gray-400 select-none">
          🔒 End-to-end encrypted messaging · Real-time Firebase
        </div>
      </div>
    </div>
  );
};
