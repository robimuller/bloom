// WomenRequestsScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  SegmentedButtons,
  Card,
  Text as PaperText,
  Button as PaperButton,
  useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';

export default function WomenRequestsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { requests } = useContext(RequestsContext);
  const theme = useTheme();

  // 'pending' or 'accepted'
  const [statusFilter, setStatusFilter] = useState('pending');

  // Filter requests by status. Women see requests where requesterId = user.uid.
  const filteredRequests = requests.filter((r) => r.status === statusFilter);

  // If a request is 'accepted' and has a chatId, we can open Chat.
  const handleOpenChat = (reqItem) => {
    if (!reqItem.chatId) return;
    navigation.navigate('Chat', {
      chatId: reqItem.chatId,
      dateId: reqItem.dateId,
      hostId: reqItem.hostId,
      requesterId: reqItem.requesterId,
    });
  };

  const renderRequest = ({ item }) => {
    return (
      <Card style={styles.card} mode="outlined">
        <Card.Title
          title={`Date ID: ${item.dateId}`}
          subtitle={`Host: ${item.hostId}`}
        />
        <Card.Content>
          <PaperText variant="bodyMedium" style={{ marginVertical: 4 }}>
            Status: {item.status}
          </PaperText>
        </Card.Content>

        <Card.Actions>
          {statusFilter === 'pending' ? (
            <PaperText
              variant="labelLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Awaiting response...
            </PaperText>
          ) : (
            // statusFilter === 'accepted'
            <PaperButton
              mode="contained"
              onPress={() => handleOpenChat(item)}
              buttonColor={theme.colors.primary}
              textColor="#fff"
            >
              Open Chat
            </PaperButton>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.container}>
        <PaperText variant="headlineMedium" style={styles.header}>
          Women Requests
        </PaperText>

        <SegmentedButtons
          value={statusFilter}
          onValueChange={setStatusFilter}
          buttons={[
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
          ]}
          style={styles.segments}
        />

        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 16 },
  segments: { marginBottom: 16 },
  card: { marginBottom: 12 },
});
