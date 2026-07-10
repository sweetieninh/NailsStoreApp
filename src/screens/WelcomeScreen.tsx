import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';

export const WelcomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ firstName?: string; lastVisit?: string; totalVisits?: string; customerId?: string; phone?: string }>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkinTime, setCheckinTime] = useState('');
  const [error, setError] = useState('');
  const [displayLastVisit, setDisplayLastVisit] = useState(params.lastVisit || '');

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setCheckinTime('');

    try {
      const response = await apiClient.post('/checkin', {
        businessId: APP_CONFIG.businessId,
        storeId: APP_CONFIG.storeId,
        customerId: params.customerId,
        phone: params.phone || '',
      });

      setMessage(response.data.message || 'Check-in complete!');
      if (response.data?.checkin?.checkedInAt) {
        const checkedAt = new Date(response.data.checkin.checkedInAt);
        if (!Number.isNaN(checkedAt.getTime())) {
          setDisplayLastVisit(response.data.checkin.checkedInAt);
          setCheckinTime(
            checkedAt.toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })
          );
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to create check-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back, {params.firstName || 'friend'}!</Text>
        <Text style={styles.subtitle}>Last visit: {displayLastVisit ? new Date(displayLastVisit).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'Soon'}</Text>
        <Text style={styles.subtitle}>Loyalty visits: {params.totalVisits || '0'}</Text>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {checkinTime ? <Text style={styles.success}>Checked in at: {checkinTime}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Check In" onPress={handleCheckIn} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6FB',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  success: {
    color: '#2E8B57',
    fontSize: 14,
  },
  error: {
    color: '#D14343',
    fontSize: 14,
  },
});
