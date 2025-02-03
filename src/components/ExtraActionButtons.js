// src/components/ExtraActionButtons.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';

const ExtraActionButtons = () => {
    const theme = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Message pressed')}>
                <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Bookmark pressed')}>
                <Ionicons name="bookmark" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Share pressed')}>
                <Ionicons name="share-social" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'column',  // vertical stack
            alignItems: 'center',
        },
        circleButton: {
            width: 44,
            height: 44,
            borderRadius: 22,         // creates a perfect circle
            backgroundColor: theme.colors.background,  // uses theme background
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,          // space between each button
        },
    });

export default ExtraActionButtons;