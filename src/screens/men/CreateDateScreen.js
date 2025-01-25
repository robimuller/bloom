// src/screens/CreateDateScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { DatesContext } from '../../contexts/DatesContext';
import { useTheme } from 'react-native-paper';

export default function CreateDateScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { createDate } = useContext(DatesContext);
    const paperTheme = useTheme();

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [time, setTime] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState(null);

    const handleCreateDate = async () => {
        if (!title || !location || !time || !category) {
            setError('Please fill all fields.');
            return;
        }
        if (!user) {
            setError('You must be logged in to create a date.');
            return;
        }
        try {
            await createDate({
                title,
                location,
                time, // or parse into a Timestamp
                category,
                status: 'open',
            });

            // Reset inputs
            setTitle('');
            setLocation('');
            setTime('');
            setCategory('');

            // Navigate to men feed or show success
            navigation.navigate('MenFeed');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>
            <Text style={[styles.title, { color: paperTheme.colors.text }]}>Create a Date</Text>

            <TextInput
                label="Title"
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                theme={{
                    colors: {
                        primary: paperTheme.colors.primary,
                        background: paperTheme.colors.surface,
                        text: paperTheme.colors.text,
                        placeholder: paperTheme.colors.placeholder,
                        error: paperTheme.colors.error,
                    },
                }}
            />
            <TextInput
                label="Location"
                mode="outlined"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                theme={{
                    colors: {
                        primary: paperTheme.colors.primary,
                        background: paperTheme.colors.surface,
                        text: paperTheme.colors.text,
                        placeholder: paperTheme.colors.placeholder,
                        error: paperTheme.colors.error,
                    },
                }}
            />
            <TextInput
                label="Time (e.g., 2025-02-01 6:00 PM)"
                mode="outlined"
                value={time}
                onChangeText={setTime}
                style={styles.input}
                theme={{
                    colors: {
                        primary: paperTheme.colors.primary,
                        background: paperTheme.colors.surface,
                        text: paperTheme.colors.text,
                        placeholder: paperTheme.colors.placeholder,
                        error: paperTheme.colors.error,
                    },
                }}
            />
            <TextInput
                label="Category (e.g., Food & Drinks)"
                mode="outlined"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                theme={{
                    colors: {
                        primary: paperTheme.colors.primary,
                        background: paperTheme.colors.surface,
                        text: paperTheme.colors.text,
                        placeholder: paperTheme.colors.placeholder,
                        error: paperTheme.colors.error,
                    },
                }}
            />

            {error && (
                <HelperText type="error" visible={!!error} style={styles.error}>
                    {error}
                </HelperText>
            )}

            <Button
                mode="contained"
                onPress={handleCreateDate}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={{ color: paperTheme.colors.background }}
                buttonColor={paperTheme.colors.primary}
            >
                Create
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignSelf: 'center',
    },
    input: {
        marginBottom: 10,
    },
    error: {
        marginBottom: 10,
        alignSelf: 'center',
    },
    button: {
        marginTop: 10,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});
