import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

export const SafeKeyboardAvoidingView = ({ children, style, keyboardVerticalOffset = 0 }) => {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={[styles.container, style]}
        >
            {children}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});