// src/screens/MenFeedScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme } from 'react-native-paper';

export default function MenFeedScreen({ navigation }) {
    const [profiles, setProfiles] = useState([]);
    const paperTheme = useTheme();

    useEffect(() => {
        // TODO: Implement your data fetching logic here
        // Example:
        // fetchProfiles().then(setProfiles).catch(console.error);
    }, []);

    // Placeholder for profile items
    const renderProfiles = () => {
        return profiles.map((profile) => (
            <Card key={profile.id} style={styles.card}>
                <Card.Title title={profile.name} subtitle={profile.location} />
                <Card.Content>
                    <Text>{profile.description}</Text>
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate('Profile', { profileId: profile.id })}
                        color={paperTheme.colors.primary}
                    >
                        View Profile
                    </Button>
                </Card.Actions>
            </Card>
        ));
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: paperTheme.colors.background },
            ]}
        >
            <Text style={[styles.title, { color: paperTheme.colors.text }]}>Men Feed</Text>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('CreateDate')}
                style={styles.createButton}
                buttonColor={paperTheme.colors.primary}
                textColor={paperTheme.colors.background}
            >
                Go to Create Date
            </Button>

            {/* Render profiles */}
            {profiles.length > 0 ? (
                renderProfiles()
            ) : (
                <Text style={{ color: paperTheme.colors.placeholder }}>
                    No profiles available at the moment.
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    createButton: {
        marginBottom: 20,
        width: '100%',
    },
    card: {
        width: '100%',
        marginBottom: 16,
    },
});
