import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const NotificationsStep = ({ permissions, updatePermissions, colors }) => (
    <View style={styles.panel}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.row}>
            <Switch
                value={permissions.notifications || false}
                onValueChange={(val) => updatePermissions({ notifications: val })}
            />
            <Text style={styles.bodyText}>{permissions.notifications ? 'Notifications On' : 'Notifications Off'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    panel: { marginVertical: 8 },
    title: { fontSize: 25, fontWeight: '500' },
    row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    bodyText: { fontSize: 16, marginTop: 8 },
});

export default NotificationsStep;