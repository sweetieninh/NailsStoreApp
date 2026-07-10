import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { TodayCheckedInCustomersResponse } from '../types';

type ListItem = TodayCheckedInCustomersResponse['customers'][number];

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const OrderScreen = () => {
  const [customers, setCustomers] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTodayCustomers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<TodayCheckedInCustomersResponse>('/checkin/today', {
        params: {
          businessId: APP_CONFIG.businessId,
          storeId: APP_CONFIG.storeId,
        },
      });

      setCustomers(response.data.customers || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load checked-in customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTodayCustomers();
    }, [loadTodayCustomers])
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Today Checked-In Customers</Text>
        <Text style={styles.subtitle}>Newest check-ins first</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={customers}
          keyExtractor={(item) => item.checkinId}
          ListEmptyComponent={
            loading ? <Text style={styles.empty}>Loading...</Text> : <Text style={styles.empty}>No customers checked in today.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.time}>{formatTime(item.checkedInAt)}</Text>
              </View>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />

        <Button title="Refresh" onPress={() => void loadTodayCustomers()} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6FB',
    padding: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  listContent: {
    gap: 10,
    paddingBottom: 10,
    flexGrow: 1,
  },
  row: {
    borderWidth: 1,
    borderColor: '#F3D4E6',
    borderRadius: 14,
    padding: 12,
    gap: 4,
    backgroundColor: '#FFF9FD',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2F2F',
  },
  time: {
    fontSize: 13,
    color: '#6B7280',
  },
  phone: {
    fontSize: 14,
    color: '#4B5563',
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 18,
  },
  error: {
    color: '#D14343',
    fontSize: 13,
  },
});
