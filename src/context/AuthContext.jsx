import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../lib/firebase'; 
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
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


    async function signInWithGoogle() {
        try {
            setError('');
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (error) {
            console.error('Google sign in error:', error);
            setError(getErrorMessage(error.code));
            throw error;
        }
    }

    async function signInWithGitHub() {
        try {
            setError('');
            const result = await signInWithPopup(auth, githubProvider);
            return result;
        } catch (error) {
            console.error('GitHub sign in error:', error);
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
                return 'Sign-in was cancelled. Please try again.';
            case 'auth/cancelled-popup-request':
                return 'Sign-in was cancelled due to another popup request.';
            case 'auth/popup-blocked':
                return 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check your credentials.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection and try again.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled. Please contact support.';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with this email using a different sign-in method.';
            case 'auth/timeout':
                return 'The operation timed out. Please try again.';
            default:
                return 'An error occurred during authentication. Please try again.';
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });

        // No need for redirect result handling since we're using popup only

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        error,
        clearError,
        signInWithGoogle,
        signInWithGitHub,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}