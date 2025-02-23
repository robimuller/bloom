import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';

const BioStep = ({ profileInfo, updateProfileInfo, colors }) => (
    <View style={styles.panel}>
        <Text style={[styles.title, { color: colors.text }]}>Bio</Text>
        <CustomTextInput
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            value={profileInfo.bio || ''}
            onChangeText={(val) => updateProfileInfo({ bio: val })}
            style={styles.textArea}
        />
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    textArea: { height: 100, textAlignVertical: 'top' },
});

export default BioStep;