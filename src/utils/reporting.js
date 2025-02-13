// src/utils/reporting.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const reportItem = async ({
    reportType, // 'userProfile', 'date', or 'promotion'
    itemId,     // the id of the item being reported (user, date, promotion)
    reporterId,
    reasons,
}) => {
    try {
        const reportsRef = collection(db, 'reports');
        await addDoc(reportsRef, {
            reportType,
            itemId,
            reporterId,
            reasons,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error reporting item:', error);
        throw error;
    }
};