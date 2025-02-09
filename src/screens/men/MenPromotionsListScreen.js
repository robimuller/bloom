// src/screens/men/PromotionsListScreen.js
import React, { useContext } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { PromotionsContext } from '../../contexts/PromotionsContext';
import PromotionsCard from '../../components/PromotionsCard';

export default function MenPromotionsListScreen({ navigation }) {
  const { promotions, loading } = useContext(PromotionsContext);
  const theme = useTheme();

  const renderItem = ({ item }) => (
    <PromotionsCard
      promotion={item}
      onPress={(promo) => navigation.navigate('MenPromotionDetail', { promo })}
      onAttach={(promo) => console.log('Attach promotion:', promo)}
      onMarkInterest={(promo) => console.log("I'm interested in:", promo)}
    />
  );

  if (loading) {
    return <Text style={[styles.loading, { color: theme.colors.text }]}>Loading promotions...</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  loading: {
    marginTop: 16,
    textAlign: 'center',
  },
});