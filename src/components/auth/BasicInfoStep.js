import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CustomTextInput from '../CustomTextInput';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BasicInfoStep = ({ basicInfo, updateBasicInfo, shouldShakeField, colors }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.panel}>
            <View style={{ gap: 10 }}>
                <Text style={[styles.subHeader, { color: colors.secondary }]}>First Name</Text>
                <CustomTextInput
                    shake={shouldShakeField('firstName')}
                    placeholder="e.g.: Alex"
                    value={basicInfo.firstName}
                    onChangeText={(val) => updateBasicInfo({ firstName: val })}
                />
                <Text style={[styles.subHeader, { color: colors.secondary }]}>Email</Text>
                <CustomTextInput
                    shake={shouldShakeField('email')}
                    placeholder="e.g.: mycool@email.com"
                    keyboardType="email-address"
                    value={basicInfo.email}
                    onChangeText={(val) => updateBasicInfo({ email: val })}
                />
                <Text style={[styles.subHeader, { color: colors.secondary }]}>Password</Text>
                <CustomTextInput
                    shake={shouldShakeField('password')}
                    placeholder="Your very secure password here"
                    secureTextEntry={!showPassword}
                    value={basicInfo.password}
                    onChangeText={(val) => updateBasicInfo({ password: val })}
                    style={{ paddingRight: 40 }}
                    rightIcon={
                        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors.primary} />
                        </TouchableOpacity>
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    subHeader: { fontSize: 16, fontWeight: '500' },
});

export default BasicInfoStep;