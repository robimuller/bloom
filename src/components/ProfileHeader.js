import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { calculateAge } from '../utils/deduceAge';
import { useUserStatus } from '../hooks/useUserStatus';
import { useTheme } from '../contexts/ThemeContext';

const ProfileHeader = React.memo(({ item, onPress, onFlagPress, colors }) => {
    const userStatus = useUserStatus(item.id);
    const age = calculateAge(item.birthday);

    return (
        <View style={styles.header}>
            {/* Only the image is pressable */}
            <TouchableOpacity onPress={() => onPress(item)}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={
                            item.photos && item.photos[0]
                                ? { uri: item.photos[0] }
                                : require('../../assets/avatar-placeholder.png')
                        }
                        style={styles.profilePic}
                    />
                    {userStatus === 'online' && <View style={styles.onlineIndicator} />}
                </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={[styles.hostName, { color: colors.text }]}>
                    {item.firstName || 'Unknown'}{age ? `, ${age}` : ''}
                </Text>
            </View>
            <TouchableOpacity onPress={() => onFlagPress(item)}>
                <Ionicons
                    name="flag-outline"
                    size={20}
                    color={colors.onSurface ?? '#666'}
                    style={{ marginRight: 8 }}
                />
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    hostName: {
        fontWeight: '600',
        fontSize: 16,
    },
    onlineIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'green',
        borderWidth: 2,
        borderColor: '#fff',
    },
});

export default ProfileHeader;