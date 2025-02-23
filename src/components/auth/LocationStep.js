import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const LocationStep = ({ locationInfo, permissions, updatePermissions, colors }) => (
    <View style={styles.panel}>
        <Text style={styles.title}>Location Permission</Text>
        <Text style={styles.bodyText}>(Optional) Enable location to find matches near you.</Text>
        <View style={styles.row}>
            <Switch
                value={permissions.location || false}
                onValueChange={(val) => updatePermissions({ location: val })}
            />
            <Text style={styles.bodyText}>{permissions.location ? 'Enabled' : 'Disabled'}</Text>
        </View>
        {permissions.location && locationInfo.city && (
            <Text style={[styles.bodyText, { marginTop: 10 }]}>Detected City: {locationInfo.city}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    bodyText: { fontSize: 16, marginTop: 8 },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
});

export default LocationStep;