// src/components/CreateDateLayout.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GradientProgressBar from './GradientProgressBar';
import ShootingLightButton from './ShootingLightButton';
import PromotionSummaryBanner from './PromotionSummaryBanner';

export default function CreateDateLayout({
    step = 1,
    totalSteps = 5,
    hostPhoto,
    hostName,
    hostAge,
    title = 'Create Date',
    subtitle,
    errorComponent,
    canGoBack = false,
    onBack,
    onNext,
    nextLabel = 'Next',
    backLabel = 'Back',
    children,
    selectedPromotion, // The selected promotion object
    onEditPromotion,   // Callback to edit or remove the promotion
    onPressBanner,     // Callback for when the banner is pressed
}) {
    const navigation = useNavigation();
    const theme = useTheme();
    const handleBack = onBack ? onBack : () => navigation.navigate('MenHome');
    const progress = step / totalSteps;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{title}</Text>
            </View>

            {/* Persistent Promotion Summary Banner */}
            {/* Persistent Promotion Summary Banner */}
            {selectedPromotion && (
                <PromotionSummaryBanner
                    promotion={selectedPromotion}
                    onRemove={onEditPromotion}   // Pass your removal callback here using onRemove
                    onPressBanner={onPressBanner}  // Your existing onPressBanner callback
                />
            )}

            {/* TOP SECTION */}
            <View style={styles.topSection}>
                {subtitle && (
                    <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.secondary }]}>
                        {subtitle}
                    </Text>
                )}
                <View style={{ marginTop: 8 }}>
                    <GradientProgressBar progress={progress} />
                </View>
                {errorComponent}
            </View>

            {/* MIDDLE CARD SECTION */}
            <View style={styles.cardSection}>
                <View style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}>
                    <ScrollView contentContainerStyle={styles.cardContent}>
                        {children}
                    </ScrollView>
                </View>
            </View>

            {/* BOTTOM NAVIGATION */}
            <View style={styles.bottomNav}>
                {canGoBack ? (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[styles.outlinedBtn, { borderColor: theme.colors.primary }]}
                    >
                        <IconButton
                            icon="arrow-left"
                            size={20}
                            iconColor={theme.colors.primary}
                            style={{ margin: 0, marginRight: 4 }}
                        />
                        <Text style={[styles.outlinedBtnText, { color: theme.colors.primary }]}>{backLabel}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.buttonPlaceholder} />
                )}
                <ShootingLightButton label={nextLabel} icon="arrow-right" onPress={onNext} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    /* HEADER STYLES */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    /* TOP SECTION */
    topSection: {
        paddingTop: 16,
        paddingBottom: 12,
    },
    subtitle: {
        marginBottom: 12,
    },
    /* CARD SECTION */
    cardSection: {
        flex: 1,
        marginBottom: 16,
    },
    card: {
        flex: 1,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    cardContent: {
        flexGrow: 1,
        padding: 16,
    },
    /* BOTTOM NAVIGATION */
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    buttonPlaceholder: {
        width: 120,
        height: 48,
    },
    outlinedBtn: {
        minWidth: 120,
        height: 48,
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlinedBtnText: {
        fontSize: 16,
    },
});