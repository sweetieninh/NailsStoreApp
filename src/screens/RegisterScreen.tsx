import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';

export const RegisterScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: params.phone || '',
    email: '',
    birthday: '',
    allowSMS: true,
    allowEmail: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post('/customers/register', {
        businessId: APP_CONFIG.businessId,
        storeId: APP_CONFIG.storeId,
        ...form,
      });

      setMessage(response.data.message || 'Registration complete!');
      router.push({ pathname: '/welcome', params: { firstName: form.firstName, totalVisits: '1', customerId: response.data.customer?.customerId || '' } });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to register customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>New customer</Text>
        <TextInput value={form.firstName} onChangeText={(value) => setForm({ ...form, firstName: value })} placeholder="First name" />
        <TextInput value={form.lastName} onChangeText={(value) => setForm({ ...form, lastName: value })} placeholder="Last name" />
        <TextInput value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} placeholder="Phone" keyboardType="phone-pad" />
        <TextInput value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} placeholder="Email" keyboardType="email-address" />
        <TextInput value={form.birthday} onChangeText={(value) => setForm({ ...form, birthday: value })} placeholder="Birthday" />

        <View style={styles.toggleRow}>
          <Text>Allow SMS</Text>
          <Switch value={form.allowSMS} onValueChange={(value) => setForm({ ...form, allowSMS: value })} />
        </View>
        <View style={styles.toggleRow}>
          <Text>Allow Email</Text>
          <Switch value={form.allowEmail} onValueChange={(value) => setForm({ ...form, allowEmail: value })} />
        </View>

        {message ? <Text style={styles.success}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Register & Check In" onPress={handleSubmit} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF6FB',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
