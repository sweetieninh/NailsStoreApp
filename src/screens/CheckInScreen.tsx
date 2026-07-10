import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { CustomerLookupResponse } from '../types';

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const CheckInScreen = () => {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const keypad = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0], []);

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const clearPhone = () => {
    setPhone('');
    setError('');
    setSuccessMessage('');
  };

  useFocusEffect(
    useCallback(() => {
      clearPhone();
    }, [])
  );

  const handleKeyPress = (value: string | number) => {
    if (value === '⌫') {
      setPhone((prev) => formatPhone(prev.slice(0, -1)));
      if (error) setError('');
      if (successMessage) setSuccessMessage('');
      return;
    }

    setPhone((prev) => formatPhone(prev + String(value)));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleLookup = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a full 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiClient.post<CustomerLookupResponse>('/checkin/lookup', {
        businessId: APP_CONFIG.businessId,
        storeId: APP_CONFIG.storeId,
        phone: phone.replace(/\D/g, ''),
      });

      if (response.data.customerExists && response.data.customer) {
        setSuccessMessage('Welcome back!');
        router.push({ pathname: '/welcome', params: { firstName: response.data.customer.firstName, lastVisit: response.data.customer.statistics?.lastVisit || '', totalVisits: String(response.data.customer.statistics?.totalVisits || 0), customerId: response.data.customer.customerId } });
      } else {
        setSuccessMessage('New customer detected.');
        router.push({ pathname: '/register', params: { phone: phone.replace(/\D/g, '') } });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to lookup customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{APP_CONFIG.storeName}</Text>
        <Text style={styles.subtitle}>Check in with your phone number</Text>

        <TextInput
          value={phone}
          onChangeText={handlePhoneChange}
          placeholder="(555) 123-4567"
          keyboardType="phone-pad"
          maxLength={14}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <View style={styles.keypad}>
          {keypad.map((item) => (
            <View key={item} style={styles.keypadItem}>
              <Button title={String(item)} onPress={() => handleKeyPress(item)} />
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button title="Clear" onPress={clearPhone} disabled={!phone || loading} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Continue" onPress={handleLookup} loading={loading} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF6FB',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  keypadItem: {
    width: '31%',
    marginBottom: 10,
  },
  error: {
    color: '#D14343',
    fontSize: 13,
  },
  success: {
    color: '#2E8B57',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
