import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomTextInput from '../CustomTextInput';

const BioStep = ({ profileInfo, setProfileInfo, colors }) => (
    <View style={styles.panel}>
        <Text style={[styles.title, { color: colors.text }]}>
            Add a short description about yourself.
        </Text>
        <CustomTextInput
            placeholder="Tell us about yourself..."
            multiline
            numberOfLines={4}
            value={profileInfo.bio || ''}
            onChangeText={(val) =>
                setProfileInfo((prev) => ({ ...prev, bio: val }))
            } style={styles.textArea}
            paddingLeft={10}
            paddingTop={10}
            maxLength={300}
        />
        <Text style={[styles.charCount, { color: colors.secondary }]}>
            {(profileInfo.bio?.length || 0)} / 300 characters
        </Text>
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8, flex: 1 },
    title: { fontSize: 20, fontWeight: '500', marginBottom: 6 },
    textArea: { height: 400, textAlignVertical: 'top', paddingTop: 20, paddingLeft: 20 },
    charCount: { textAlign: 'center', marginTop: 0, fontSize: 14, fontWeight: "300" },
});

export default BioStep;