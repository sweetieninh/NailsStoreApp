import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../components/Button';

export const ReportsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ firstName?: string; lastName?: string }>();
  const managerName = `${params.firstName || 'Sarah'} ${params.lastName || 'Johnson'}`.trim();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Manager: {managerName}</Text>

        <View style={styles.actionsRow}>
          <Button title="Store Reports" onPress={() => router.push('/ReportByStore')} />
          <Button
            title="Technician Reports"
            onPress={() => router.push('/ReportByTechnician')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6FB',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#4B5563',
  },
  actionsRow: {
    marginTop: 14,
    gap: 10,
  },
});
