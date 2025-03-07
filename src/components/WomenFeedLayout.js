import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text as PaperText } from 'react-native-paper';

const HEADER_HEIGHT = 60;

const WomenFeedLayout = ({ headerTitle = 'Explore', children }) => {
    const { colors } = useThemeContext();
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');

    // Override header title based on route params (if any)
    let displayTitle = headerTitle;
    if (route.params?.section) {
        switch (route.params.section) {
            case 'newcomers':
                displayTitle = 'Newcomers';
                break;
            case 'recommended':
                displayTitle = 'Recommended For You';
                break;
            case 'promotions':
                displayTitle = 'Promotions';
                break;
            case 'explore':
                displayTitle = 'Explore';
                break;
            default:
                displayTitle = headerTitle;
        }
    }

    // Compute dynamic tab bar height:
    const BASE_TAB_BAR_HEIGHT = SCREEN_HEIGHT * 0.08;
    const TAB_BAR_HEIGHT = BASE_TAB_BAR_HEIGHT + insets.bottom;

    // Compute content height by subtracting header and tab bar heights.
    const contentHeight = SCREEN_HEIGHT - HEADER_HEIGHT - TAB_BAR_HEIGHT - 42;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                    <Icon name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <PaperText variant="headlineMedium" style={[styles.headerTitle, { color: colors.text }]}>
                    {displayTitle}
                </PaperText>
            </View>

            {/* Content Area */}
            <View style={[styles.contentArea, { height: contentHeight }]}>
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
});

export default WomenFeedLayout;