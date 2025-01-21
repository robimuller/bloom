// AppNavigator.js
import React, { useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../../config/firebase';
import { AppContext } from '../context/AppContext';

import AuthStack from './AuthStack';
import MenTabNavigator from './men/MenTabNavigator';
import WomenTabNavigator from './women/WomenTabNavigator';

export default function AppNavigator() {
    const { user, setUser, role, setRole } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // fetch role from Firestore
                const userDoc = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userDoc);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setRole(data.role);  // 'male' or 'female'
                } else {
                    setRole(null);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        // simple loading or splash
        return null;
    }

    if (!user) {
        return <AuthStack />;
    }

    // If user is logged in, route them by role:
    if (role === 'male') {
        return <MenTabNavigator />;
    } else if (role === 'female') {
        return <WomenTabNavigator />;
    } else {
        // if we don't know the role yet, or there's an error
        return null;
    }
}
