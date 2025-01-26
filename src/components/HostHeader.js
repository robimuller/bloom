// src/components/HostHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';

function HostHeader({ photo, name, age, theme = {} }) {
    const firstLetter = (name || 'U')[0].toUpperCase();

    // Use destructuring with defaults
    const {
        primary = '#ff1a1a',
        onPrimary = '#ffffff',
        text = '#1c0304',
    } = theme;

    return (
        <View style={styles.hostInfo}>
            {photo ? (
                <Image
                    style={styles.hostImage}
                    source={{ uri: photo }}
                    contentFit="cover"
                    transition={500}
                />
            ) : (
                <View style={[styles.hostPlaceholder, { backgroundColor: primary }]}>
                    <Text style={{ color: onPrimary, fontWeight: 'bold' }}>
                        {firstLetter}
                    </Text>
                </View>
            )}

            <Text style={[styles.hostName, { color: text }]}>
                {name ? `${name}, ${age || ''}` : 'Host'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hostImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    hostPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hostName: {
        fontSize: 16,
        fontWeight: '600',
    },
});

// Wrap in React.memo if desired
export default React.memo(HostHeader);
