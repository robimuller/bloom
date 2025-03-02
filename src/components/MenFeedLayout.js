import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation
import {
    Text as PaperText,
    Button as PaperButton,
    Divider,
    useTheme,
} from 'react-native-paper';

const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 60; // Adjust based on your tab navigator

const MenFeedLayout = ({
    headerTitle = 'Explore',
    children,
    colors = { background: '#fff', text: '#000', primary: '#007AFF' },
}) => {
    const navigation = useNavigation();  // Get navigation object
    const insets = useSafeAreaInsets();
    const { height: SCREEN_HEIGHT } = Dimensions.get('window');
    const contentHeight =
        SCREEN_HEIGHT -
        HEADER_HEIGHT -
        TAB_BAR_HEIGHT -
        insets.bottom;

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
        paddingVertical: 12,
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
    interactionArea: {
        height: FOOTER_HEIGHT,
        flexDirection: 'row',
        justifyContent: 'space-around',
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