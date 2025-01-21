// CreateDateScreen.js (Men side)
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { AppContext } from '../../context/AppContext';

export default function CreateDateScreen({ navigation }) {
    const { user } = useContext(AppContext);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState(''); // or use a date-time picker
    const [category, setCategory] = useState('');
    const [error, setError] = useState(null);

    const handleCreateDate = async () => {
        if (!title || !location || !time || !category) {
            setError('Please fill all fields.');
            return;
        }
        try {
            // Create the date doc
            await addDoc(collection(db, 'dates'), {
                hostId: user.uid,
                title,
                location,
                time, // or convert to timestamp
                category,
                status: 'open',
                createdAt: Timestamp.now(),
            });

            // Reset inputs
            setTitle('');
            setLocation('');
            setTime('');
            setCategory('');

            // Navigate back or to some "MenFeed" screen to show new date
            navigation.navigate('MenFeed');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create a Date</Text>
            <TextInput
                placeholder="Title"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                placeholder="Location"
                style={styles.input}
                value={location}
                onChangeText={setLocation}
            />
            <TextInput
                placeholder="Time (e.g. 2025-02-01 6:00 PM)"
                style={styles.input}
                value={time}
                onChangeText={setTime}
            />
            <TextInput
                placeholder="Category (e.g. Food & Drinks)"
                style={styles.input}
                value={category}
                onChangeText={setCategory}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button title="Create" onPress={handleCreateDate} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: {
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    error: { color: 'red', marginBottom: 10 },
});
