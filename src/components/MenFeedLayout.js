import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../contexts/ThemeContext';

import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
    Text as PaperText,
    Button as PaperButton,
    Divider,
    useTheme,
} from 'react-native-paper';

const HEADER_HEIGHT = 60;

const MenFeedLayout = ({
    headerTitle = 'Explore',
    children,
}) => {
    const { colors } = useThemeContext();

    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');

    // Compute dynamic tab bar height:
    // Use 8% of the screen height as the base value and add the bottom safe area inset.
    const BASE_TAB_BAR_HEIGHT = SCREEN_HEIGHT * 0.08;
    const TAB_BAR_HEIGHT = BASE_TAB_BAR_HEIGHT + insets.bottom;

    // Compute content height by subtracting header and dynamic tab bar heights.
    const contentHeight = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT - 42;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <PaperText variant="headlineMedium" style={[styles.headerTitle, { color: colors.text }]}>
                    {headerTitle}
                </PaperText>
            </View>

            {/* Content Area */}
            <View style={[styles.contentArea, { flex: 1, backgroundColor: colors.background }]}>
                {typeof children === 'function' ? children(contentHeight) : children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        height: HEADER_HEIGHT,
        paddingHorizontal: 16,
    },
    headerBackButton: {
        padding: 8,
        zIndex: 2,
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        zIndex: 1,
    },
    contentArea: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        alignItems: 'center',
    },
    buttonText: {
        marginTop: 4,
        fontSize: 16,
    },
});

export default MenFeedLayout;