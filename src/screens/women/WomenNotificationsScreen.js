import React, { useState, useContext, memo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  SectionList,
  View,
  Pressable,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text as PaperText,
  Button as PaperButton,
  Divider,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AuthContext } from '../../contexts/AuthContext';
import { RequestsContext } from '../../contexts/RequestsContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const fallbackPhoto = 'https://via.placeholder.com/100?text=No+Photo';

// Enable LayoutAnimation on Android.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Custom hook to subscribe to the latest message for a given chatId.
 */
function useLastMessage(chatId) {
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setLastMessage({ id: docSnap.id, ...docSnap.data() });
      } else {
        setLastMessage(null);
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  return lastMessage;
}

/**
 * Helper to format Firestore timestamps (or Date objects) into a locale string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Groups requests by their createdAt timestamp.
 * The group labels are determined by how old the timestamp is.
 */
function groupRequests(requests) {
  const groups = {};
  requests.forEach((request) => {
    const timestamp = request.createdAt;
    let groupLabel = 'Older';
    if (timestamp) {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays < 1) {
        groupLabel = 'Today';
      } else if (diffDays < 7) {
        groupLabel = 'This Week';
      } else if (diffDays < 30) {
        groupLabel = 'This Month';
      } else {
        groupLabel = 'Older';
      }
    } else {
      groupLabel = 'No Date';
    }
    if (!groups[groupLabel]) groups[groupLabel] = [];
    groups[groupLabel].push(request);
  });

  const sections = Object.keys(groups).map((label) => ({
    title: label,
    data: groups[label].sort((a, b) => {
      const aTime =
        a.createdAt && a.createdAt.toMillis
          ? a.createdAt.toMillis()
          : new Date(a.createdAt).getTime();
      const bTime =
        b.createdAt && b.createdAt.toMillis
          ? b.createdAt.toMillis()
          : new Date(b.createdAt).getTime();
      return bTime - aTime;
    }),
  }));

  const order = ['Today', 'This Week', 'This Month', 'Older', 'No Date'];
  sections.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  return sections;
}

/**
 * CustomTabBar renders an animated tab bar with a sliding indicator.
 */
const CustomTabBar = ({ activeTab, onChange }) => {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const containerPadding = 32; // (16 on each side)
  const tabWidth = (width - containerPadding) / 2;

  const indicator = useRef(new Animated.Value(activeTab === 'pending' ? 0 : tabWidth)).current;

  useEffect(() => {
    const toValue = activeTab === 'pending' ? 0 : tabWidth;
    Animated.spring(indicator, {
      toValue,
      useNativeDriver: false,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [activeTab, indicator, tabWidth]);

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.cardBackground }]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.primary,
            width: tabWidth,
            transform: [{ translateX: indicator }],
          },
        ]}
      />
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onChange('pending')}
        activeOpacity={0.8}
      >
        <Icon name="bell" size={20} color={activeTab === 'pending' ? '#fff' : theme.colors.text} />
        <PaperText style={[styles.tabLabel, { color: activeTab === 'pending' ? '#fff' : theme.colors.text }]}>
          Pending
        </PaperText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onChange('accepted')}
        activeOpacity={0.8}
      >
        <Icon name="chat" size={20} color={activeTab === 'accepted' ? '#fff' : theme.colors.text} />
        <PaperText style={[styles.tabLabel, { color: activeTab === 'accepted' ? '#fff' : theme.colors.text }]}>
          Accepted
        </PaperText>
      </TouchableOpacity>
    </View>
  );
};

/**
 * RequestItem renders a single notification.
 * - For accepted requests: displays a two‑row layout using the host’s data.
 * - For pending requests: renders a simple card.
 */
const RequestItem = memo(function RequestItem({
  item,
  isExpanded,
  statusFilter,
  onToggleExpand,
  onAccept,
  onReject,
  onOpenChat,
}) {
  // For women, show the match's (host's) data when accepted.
  const { requesterDoc = {}, hostDoc = {}, dateDoc = {} } = item;
  const photoUrl = hostDoc.photos?.[0] || fallbackPhoto;
  const cacheKey = `avatar-${item.hostId}`;
  const theme = useTheme();
  const lastMessage = useLastMessage(item.chatId);

  if (statusFilter === 'accepted') {
    return (
      <Pressable onPress={() => onOpenChat(item)} style={styles.acceptedRow}>
        <Image
          source={{ uri: photoUrl }}
          style={styles.profilePic}
          contentFit="cover"
          cachePolicy="memory-disk"
          cacheKey={cacheKey}
          transition={false}
        />
        <View style={styles.acceptedTextContainer}>
          <PaperText style={styles.nameText}>
            {(hostDoc && hostDoc.displayName) || 'Unknown'}
          </PaperText>
          {lastMessage ? (
            <PaperText style={[styles.chatHistory, { color: theme.colors.secondary }]} numberOfLines={1}>
              {lastMessage.text} • {formatTimestamp(lastMessage.createdAt)}
            </PaperText>
          ) : (
            <PaperText style={[styles.chatHistory, { color: theme.colors.secondary }]}>
              No messages yet.
            </PaperText>
          )}
        </View>
      </Pressable>
    );
  }

  // Render a simple card for pending requests.
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardTitleContainer}>
        <PaperText style={styles.cardTitle}>{`Date ID: ${item.dateId}`}</PaperText>
        <PaperText style={styles.cardSubtitle}>{`Host: ${item.hostId}`}</PaperText>
      </View>
      <View style={styles.cardContent}>
        <PaperText variant="bodyMedium" style={{ marginVertical: 4 }}>
          Status: {item.status}
        </PaperText>
      </View>
      <View style={styles.cardActions}>
        <PaperText variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Awaiting response...
        </PaperText>
      </View>
    </View>
  );
});

export default function WomenNotificationsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { requests } = useContext(RequestsContext);
  const theme = useTheme();

  // The status filter can be either 'pending' or 'accepted'
  const [statusFilter, setStatusFilter] = useState('pending');

  // Filter the requests based on the selected status.
  const filteredRequests = requests.filter((r) => r.status === statusFilter);

  // For accepted requests with a chatId, open the chatroom.
  const handleOpenChat = (reqItem) => {
    if (!reqItem.chatId) return;
    navigation.navigate('Chat', {
      chatId: reqItem.chatId,
      dateId: reqItem.dateId,
      hostId: reqItem.hostId,
      requesterId: reqItem.requesterId,
    });
  };

  return (
    <LinearGradient colors={theme.colors.mainBackground} style={styles.gradient}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <PaperText variant="headlineMedium" style={[styles.headerTitle, { color: theme.colors.text }]}>
            Notifications
          </PaperText>
        </View>

        {/* Custom Tab Bar */}
        <CustomTabBar activeTab={statusFilter} onChange={(tab) => setStatusFilter(tab)} />

        {statusFilter === 'accepted' ? (
          <SectionList
            sections={groupRequests(filteredRequests)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RequestItem
                item={item}
                statusFilter={statusFilter}
                onToggleExpand={() => { }}
                onAccept={() => { }}
                onReject={() => { }}
                onOpenChat={handleOpenChat}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <PaperText style={[styles.sectionHeader, { color: theme.colors.text }]}>{title}</PaperText>
            )}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <PaperText style={{ color: theme.colors.onSurfaceVariant, alignSelf: 'center', marginTop: 20 }}>
                No {statusFilter} requests available.
              </PaperText>
            }
          />
        ) : (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RequestItem
                item={item}
                isExpanded={null} // Pending items do not expand in this design.
                statusFilter={statusFilter}
                onToggleExpand={() => { }}
                onAccept={() => { }}
                onReject={() => { }}
                onOpenChat={handleOpenChat}
              />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <PaperText style={{ color: theme.colors.onSurfaceVariant, alignSelf: 'center', marginTop: 20 }}>
                No {statusFilter} requests available.
              </PaperText>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerBackButton: {
    padding: 8,
    zIndex: 2,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    zIndex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    borderRadius: 25,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // Android elevation
    elevation: 3,
  },
  cardTitleContainer: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    marginBottom: 8,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  acceptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  acceptedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatHistory: {
    fontSize: 14,
    marginTop: 4,
  },
});