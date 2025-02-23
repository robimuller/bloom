import React from 'react';
import { View, Text, TouchableOpacity, Image, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PhotosStep = ({ profileInfo, updateProfileInfo, colors }) => {
    const handlePickPhoto = async () => {
        const pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (!pickerResult.canceled && pickerResult.assets?.[0]) {
            const newPhotos = [...(profileInfo.photos || [])];
            newPhotos.push(pickerResult.assets[0].uri);
            updateProfileInfo({ photos: newPhotos });
        }
    };

    const removePhoto = (idx) => {
        const newPhotos = [...(profileInfo.photos || [])];
        newPhotos.splice(idx, 1);
        updateProfileInfo({ photos: newPhotos });
    };

    return (
        <View style={styles.panel}>
            <Text style={styles.title}>Upload Photos</Text>
            <TouchableOpacity onPress={handlePickPhoto} style={styles.button}>
                <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
            <View style={styles.photoRow}>
                {(profileInfo.photos || []).map((uri, idx) => (
                    <Pressable key={idx} onLongPress={() => removePhoto(idx)} style={styles.photoContainer}>
                        <Image source={{ uri }} style={styles.photo} />
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    button: { backgroundColor: '#FCABFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start', marginTop: 10 },
    buttonText: { color: '#fff', fontSize: 16 },
    photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    photoContainer: { width: 80, height: 80, marginRight: 10, marginBottom: 10, borderRadius: 6, overflow: 'hidden' },
    photo: { width: '100%', height: '100%', resizeMode: 'cover' },
});

export default PhotosStep;