import React from 'react';
import { View } from 'react-native';
import BirthdayPicker from '../BirthdayPicker';

const BirthdayStep = ({ basicInfo, setBasicInfo }) => (
    <View style={{ marginVertical: 8 }}>
        <BirthdayPicker
            birthday={basicInfo.birthday}
            updateBirthday={(val) =>
                setBasicInfo({ ...basicInfo, birthday: val })
            }
        />
    </View>
);

export default BirthdayStep;