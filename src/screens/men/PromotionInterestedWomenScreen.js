// src/screens/men/PromotionInterestedWomenScreen.js
import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    Modal,
    Alert,
} from 'react-native';
import { useTheme, Button, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ShootingLightButton from '../../components/ShootingLightButton';
import { UserProfileContext } from '../../contexts/UserProfileContext';
import { reportItem } from '../../utils/reporting';
import { AuthContext } from '../../contexts/AuthContext';
import { calculateAge } from '../../utils/deduceAge';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const CARD_GAP = 16;
// For this example we assume availableHeight is computed as follows:
const availableHeight = SCREEN_HEIGHT - HEADER_HEIGHT - 100;

const REPORT_OPTIONS = ['Harassment', 'Fake Profile', 'Spam', 'Inappropriate content'];

const PromotionInterestedWomenScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { promotion } = route.params; // promotion passed via navigation
    const { femaleUsers } = useContext(UserProfileContext);
    const { user } = useContext(AuthContext);

    // State for report modal and report data
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportReasons, setReportReasons] = useState([]);
    const [reportData, setReportData] = useState(null); // will store { promotion, reportedUser }

    // Filter interested profiles
    const interestedProfiles =
        promotion.interestedWomen && femaleUsers
            ? femaleUsers.filter((user) =>
                promotion.interestedWomen.some((interested) => interested.userId === user.id)
            )
            : [];

    const toggleReason = (reason) => {
        setReportReasons((prev) =>
            prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
        );
    };

    const handleSubmitReport = async () => {
        if (reportReasons.length === 0) {
            Alert.alert('Select a reason', 'Please choose at least one reason.');
            return;
        }
        try {
            await reportItem({
                reportType: 'promotion',
                itemId: promotion.id, // reporting the promotion
                reporterId: user.id,
                reasons: reportReasons,
            });
            Alert.alert('Report Submitted', 'Thank you for your feedback.');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit report.');
            console.error('Error reporting promotion:', error);
        }
        setReportModalVisible(false);
        setReportReasons([]);
        setReportData(null);
    };

    const renderItem = ({ item }) => (
        <View
            style={[
                styles.cardContainer,
                {
                    height: availableHeight,
                    backgroundColor: colors.cardBackground,
                    marginBottom: CARD_GAP,
                },
            ]}
        >
            <Image source={{ uri: item.photos?.[0] }} style={styles.backgroundImage} />
            {/* Base overlay */}
            <View style={styles.overlay} />
            {/* Top gradient overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={styles.topGradient}
            />
            {/* Bottom gradient overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
            />
            {/* Top left container for name and interests */}
            <View style={styles.topLeftContainer}>
                <Text style={[styles.name, { color: colors.onPrimary }]}>
                    {item.displayName || item.name || 'Unnamed'}
                    {item.birthday ? `, ${calculateAge(item.birthday)}` : ''}
                </Text>
            </View>
            {/* Info container for location and bio */}
            <View style={styles.infoContainer}>
                {item.location ? (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={[styles.location, { color: colors.onPrimary }]}>{item.location}</Text>

                </View>
                ) : null}
                {item.bio ? (
                    <Text style={[styles.bio, { color: colors.onPrimary }]} numberOfLines={3}>
                        {item.bio}
                    </Text>
                ) : null}
                {item.interests ? (
                    <View style={styles.interestsContainer}>
                        {item.interests.split(',').map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={[styles.tagText, { color: colors.onPrimary }]}>
                                    {tag.trim()}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>
            {/* Report button on the card */}
            <TouchableOpacity
                onPress={() => {
                    setReportData({ promotion, reportedUser: item });
                    setReportModalVisible(true);
                }}
                style={[styles.reportCardButton, { backgroundColor: colors.cardBackground, padding: 12 }]}
            >
                <Ionicons name="flag" size={16} color={colors.primary} />
            </TouchableOpacity>
            <ShootingLightButton
                label="Premium Date"
                onPress={() => {
                    // TODO: Implement invite / promotion logic here.
                }}
                style={styles.inviteButton}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { height: HEADER_HEIGHT }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Interested Women
                </Text>
                {/* Placeholder for symmetry */}
                <View style={{ width: 24 }} />
            </View>
            {/* FlatList container */}
            <View style={styles.flatListWrapper}>
                {interestedProfiles.length > 0 ? (
                    <FlatList
                        data={interestedProfiles}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        pagingEnabled
                        decelerationRate="fast"
                        showsVerticalScrollIndicator={false}
                        snapToInterval={availableHeight + CARD_GAP}
                        snapToAlignment="start"
                        contentContainerStyle={styles.flatListContent}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.text }}>No interested profiles yet.</Text>
                    </View>
                )}
            </View>
            {/* Report Modal */}
            <Modal
                animationType="fade"
                transparent
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPressOut={() => setReportModalVisible(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalContainer, { backgroundColor: colors.background }]}
                        activeOpacity={1}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Report {reportData?.reportedUser?.displayName || 'User'}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.secondary }]}>
                            Choose the reason(s) for your report:
                        </Text>
                        {REPORT_OPTIONS.map((reason) => (
                            <View key={reason} style={styles.checkboxRow}>
                                <Checkbox.Android
                                    status={reportReasons.includes(reason) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleReason(reason)}
                                    color={colors.primary}
                                    uncheckedColor={colors.outline}
                                />
                                <Text style={{ color: colors.text }}>{reason}</Text>
                            </View>
                        ))}
                        <View style={{ alignItems: 'center', marginVertical: 16 }}>
                            <Button
                                mode="contained"
                                onPress={handleSubmitReport}
                                style={styles.reportSubmitButton}
                                textColor={colors.onPrimary}
                            >
                                Report
                            </Button>
                        </View>
                        <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                            <Text style={[styles.cancelText, { color: colors.primary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    flatListWrapper: {
        flex: 1,
    },
    flatListContent: {
        flexGrow: 1,
    },
    cardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        marginHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 350,
    },
    topLeftContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 5,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    tag: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        marginTop: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    infoContainer: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    location: {
        fontSize: 20,
        marginTop: 4,
    },
    bio: {
        fontSize: 14,
        marginTop: 8,
    },
    inviteButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    reportCardButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportSubmitButton: {
        width: '60%',
        borderRadius: 20,
    },
    cancelText: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default PromotionInterestedWomenScreen;