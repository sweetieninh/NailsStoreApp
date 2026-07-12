import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export const WelcomeScreen = () => {
  const params = useLocalSearchParams<{ firstName?: string; lastVisit?: string; totalVisits?: string; checkinMessage?: string; checkedInAt?: string }>();
  const message = params.checkinMessage || 'Check-in complete!';
  const checkinTime = params.checkedInAt || '';
  const displayLastVisit = params.lastVisit || params.checkedInAt || '';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back, {params.firstName || 'friend'}!</Text>
        <Text style={styles.subtitle}>Last visit: {displayLastVisit ? new Date(displayLastVisit).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'Soon'}</Text>
        <Text style={styles.subtitle}>Loyalty visits: {params.totalVisits || '0'}</Text>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {checkinTime ? <Text style={styles.success}>Checked in at: {checkinTime}</Text> : null}
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
});
