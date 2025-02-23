import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import HeightRuler from '../HeightRuler';
import CustomCheckbox from './CustomCheckbox'; // ensure you export this from its own file
import ReanimatedTag from './ReanimatedTag'; // import the Reanimated version of your tag

const bodyTypes = ["Athletic", "Slim", "Average", "Chubby"];

const HeightBodyTypeStep = ({ profileInfo, setProfileInfo, colors }) => {
    const initialHeight = profileInfo.height ? parseInt(profileInfo.height, 10) : 170;

    return (
        <View style={styles.panel}>
            <View style={styles.section}>
                <Text style={[styles.subHeader, { color: colors.text }]}>How tall are you?</Text>
                <HeightRuler
                    onValueChange={(val) => setProfileInfo({ ...profileInfo, height: val })}
                    initialValue={initialHeight}
                    colors={colors}
                />
                <CustomCheckbox
                    value={profileInfo.showHeight}
                    onValueChange={(val) => setProfileInfo({ ...profileInfo, showHeight: val })}
                    label="Display my height on my profile"
                    colors={colors}
                />
            </View>
            <View style={styles.section}>
                <Text style={[styles.subHeader, { color: colors.text }]}>Can you tell us your body type?</Text>
                <View style={styles.tagsContainer}>
                    {bodyTypes.map((type) => {
                        const isSelected = type === profileInfo.bodyType;
                        return (
                            <ReanimatedTag
                                key={type}
                                type={type}
                                isSelected={isSelected}
                                onPress={() => setProfileInfo({ ...profileInfo, bodyType: type })}
                                colors={colors}
                            />
                        );
                    })}
                </View>
                <CustomCheckbox
                    value={profileInfo.showBodyType}
                    onValueChange={(val) => setProfileInfo({ ...profileInfo, showBodyType: val })}
                    label="Display my body type on my profile"
                    colors={colors}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        marginVertical: 8,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 4,
    },
    section: {
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 15,
    },
});

export default HeightBodyTypeStep;