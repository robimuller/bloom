// useUserStatus.js
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useUserStatus(userId) {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!userId) return;
        const db = getDatabase();
        const statusRef = ref(db, `/status/${userId}`);
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const data = snapshot.val();
            setStatus(data?.state || 'offline');
        });
        return () => unsubscribe();
    }, [userId]);

    return status;
}