import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';

const GenderStep = ({ profileInfo, updateProfileInfo, colors, basicInfo }) => {

    const explainerOpacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // When gender changes, run a sequence to reveal the new text.
        Animated.sequence([
            Animated.timing(explainerOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(explainerOpacity, {
                toValue: 0.5,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [profileInfo.gender]);

    return (
        <View style={styles.panel}>
            <View style={styles.genderHeader}>
                <Text style={[styles.title, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}>
                    {`Hi ${basicInfo.firstName},`}
                </Text>
                <Text style={[styles.subHeader, { color: colors.secondary, textAlign: 'center', marginBottom: 20 }]}>
                    Please tell us your gender
                </Text>
            </View>
            <View style={styles.genderOptionsContainer}>
                <View style={styles.genderOption}>
                    <TouchableOpacity
                        onPress={() => updateProfileInfo({ gender: 'male' })}
                        style={[styles.circleButton, { opacity: profileInfo.gender === 'male' ? 1 : 0.5 }]}
                    >
                        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
                            <Defs>
                                <RadialGradient id="gradMale" cx="50%" cy="50%" r="50%">
                                    <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                                    <Stop offset="100%" stopColor={'#7C49C6'} stopOpacity="1" />
                                </RadialGradient>
                            </Defs>
                            <Circle cx="50" cy="50" r="50" fill="url(#gradMale)" />
                        </Svg>
                        <Ionicons
                            name="male"
                            size={40}
                            color={profileInfo.gender === 'male' ? colors.backgroundColor : colors.tertiary}
                        />
                    </TouchableOpacity>
                    <Text style={[
                        styles.genderLabel,
                        { opacity: profileInfo.gender === 'male' ? 1 : 0.5, color: profileInfo.gender === 'male' ? colors.text : colors.secondary }
                    ]}>
                        Male
                    </Text>
                </View>
                <View style={styles.genderOption}>
                    <TouchableOpacity
                        onPress={() => updateProfileInfo({ gender: 'female' })}
                        style={[styles.circleButton, { opacity: profileInfo.gender === 'female' ? 1 : 0.5 }]}
                    >
                        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
                            <Defs>
                                <RadialGradient id="gradFemale" cx="50%" cy="50%" r="50%">
                                    <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                                    <Stop offset="100%" stopColor={'#7C49C6'} stopOpacity="1" />
                                </RadialGradient>
                            </Defs>
                            <Circle cx="50" cy="50" r="50" fill="url(#gradFemale)" />
                        </Svg>
                        <Ionicons
                            name="female"
                            size={40}
                            color={profileInfo.gender === 'female' ? colors.backgroundColor : colors.tertiary}
                        />
                    </TouchableOpacity>
                    <Text style={[
                        styles.genderLabel,
                        { opacity: profileInfo.gender === 'female' ? 1 : 0.5, color: profileInfo.gender === 'female' ? colors.text : colors.secondary }
                    ]}>
                        Female
                    </Text>
                </View>
            </View>
            {profileInfo.gender && (
                <Animated.Text style={[styles.explainerText, { color: colors.text }]}>
                    {profileInfo.gender === 'male'
                        ? "As a man, it is encouraged to take the initiative. Organize outings and invite distinguished women to join you in carefully planned experiences."
                        : "As a woman, you have the grace to choose your ideal social engagements. Explore well-appointed dates and invitations from gentlemen who value chivalry, ensuring that your decisions reflect refined taste."}
                </Animated.Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    genderHeader: { alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 25, fontWeight: '500' },
    subHeader: { fontSize: 16, fontWeight: '500' },
    genderOptionsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    genderOption: { alignItems: 'center', marginHorizontal: 20 },
    circleButton: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    genderLabel: { marginTop: 10, fontSize: 16 },
    explainerText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
});

export default GenderStep;