import React from 'react';
import { View } from 'react-native';
import BirthdayPicker from '../BirthdayPicker';

const BirthdayStep = ({ profileInfo, updateProfileInfo }) => (
    <View style={{ marginVertical: 8 }}>
        <BirthdayPicker
            birthday={profileInfo.birthday}
            updateBirthday={(val) => updateProfileInfo({ birthday: val })}
        />
    </View>
);

export default BirthdayStep;