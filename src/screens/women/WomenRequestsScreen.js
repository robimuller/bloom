// WomenRequestsScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  SegmentedButtons,
  Card,
  Text as PaperText,
  Button as PaperButton,
  useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { db } from '../../../config/firebase';
import { AppContext } from '../../context/AppContext';

export default function WomenRequestsScreen({ navigation }) {
  const { user } = useContext(AppContext);

  // 'pending' or 'accepted'
  const [statusFilter, setStatusFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (!user) return;

    // Build a query for woman's requests: 
    //   1) She is the 'requesterId'
    //   2) Filter by 'pending' or 'accepted'
    const requestsRef = collection(db, 'requests');
    const q = query(
      requestsRef,
      where('requesterId', '==', user.uid),
      where('status', '==', statusFilter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      setRequests(fetched);
    });

    return () => unsubscribe();
  }, [user, statusFilter]);

  // Women can't accept/reject; this is controlled by men.
  // So for 'pending', we just show an info card.
  // For 'accepted', show "Open Chat."

  const handleOpenChat = (reqItem) => {
    if (!reqItem.chatId) return;
    navigation.navigate('Chat', {
      chatId: reqItem.chatId,
      dateId: reqItem.dateId,
      hostId: reqItem.hostId
      // If you want to pass requesterId too, do so:
      // requesterId: reqItem.requesterId
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
            <PaperText variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
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
            {
              value: 'pending',
              label: 'Pending',
            },
            {
              value: 'accepted',
              label: 'Accepted',
            },
          ]}
          style={styles.segments}
        />

        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  segments: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
});
