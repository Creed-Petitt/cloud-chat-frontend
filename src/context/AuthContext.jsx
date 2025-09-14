import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../lib/firebase'; 
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';

const AuthContext = React.createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    function clearError() {
        setError('');
    }
    async function signUpWithEmailAndPassword(email, password, fullName) {
        try {
            setError('');
            const result = await createUserWithEmailAndPassword(auth, email, password);
            
            if (fullName && result.user) {
                await updateProfile(result.user, {
                    displayName: fullName
                });
            }
            
            return result;
        } catch (error) {
            setError(getErrorMessage(error.code));
            throw error;
        }
    }

    async function signInWithEmailPassword(email, password) {
        try {
            setError('');
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (error) {
            setError(getErrorMessage(error.code));
            throw error;
        }
    }


    async function signInWithGoogle() {
        try {
            setError('');
   
            if (window.location.hostname === 'localhost') {
                await signInWithRedirect(auth, googleProvider);
                return; 
            } else {
                const result = await signInWithPopup(auth, googleProvider);
                return result;
            }
        } catch (error) {
            setError(getErrorMessage(error.code));
            throw error;
        }
    }

    async function signInWithGitHub() {
        try {
            setError('');

            if (window.location.hostname === 'localhost') {
                await signInWithRedirect(auth, githubProvider);
                return; 
            } else {
                const result = await signInWithPopup(auth, githubProvider);
                return result;
            }
        } catch (error) {
            setError(getErrorMessage(error.code));
            throw error;
        }
    }

    async function logout() {
        try {
            setError('');
            await signOut(auth);
        } catch (error) {
            setError(getErrorMessage(error.code));
            throw error;
        }
    }

    function signup(email, password) {
        return signUpWithEmailAndPassword(email, password);
    }

    function login(email, password) {
        return signInWithEmailPassword(email, password);
    }


    function getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters long.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled.';
            case 'auth/cancelled-popup-request':
                return 'Sign-in was cancelled.';
            case 'auth/popup-blocked':
                return 'Pop-up was blocked. Please allow pop-ups and try again.';
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check your credentials.';
            default:
                return 'An error occurred during authentication. Please try again.';
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    console.log('OAuth redirect successful:', result.user.email);
                }
            })
            .catch((error) => {
                setError(getErrorMessage(error.code));
                console.error('OAuth redirect error:', error);
            });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        error,
        clearError,
        signUpWithEmailAndPassword,
        signInWithEmailPassword,
        signInWithGoogle,
        signInWithGitHub,
        logout,
        signup,
        login
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}