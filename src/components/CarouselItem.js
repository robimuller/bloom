import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const CarouselItem = ({ photo, style }) => {
    const [loadError, setLoadError] = useState(false);

    // Reset error if the photo URL changes.
    useEffect(() => {
        setLoadError(false);
    }, [photo]);

    return (
        <View style={[styles.container, style]}>
            {!loadError ? (
                <Image
                    source={{ uri: photo }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover" // Ensures the image covers the container
                    onError={(error) => {
                        console.log("Image failed to load:", error);
                        setLoadError(true);
                    }}
                />
            ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.errorOverlay]}>
                    <Text style={styles.errorText}>Unable to load this photo.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent', // fallback background
    },
    errorOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080', // semi-transparent black
        zIndex: 10,
    },
    errorText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CarouselItem;