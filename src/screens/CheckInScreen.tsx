import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { CheckInResponse, CustomerLookupResponse, StaffAuthResponse } from '../types';

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const formatStaffPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const DEFAULT_STAFF_PHONE = '949-555-4001';
const DEFAULT_STAFF_PIN = '1234';

export const CheckInScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'customer' | 'staff'>('customer');
  const tabContentAnim = useRef(new Animated.Value(1)).current;

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [staffPhone, setStaffPhone] = useState(DEFAULT_STAFF_PHONE);
  const [staffPin, setStaffPin] = useState(DEFAULT_STAFF_PIN);
  const [staffActiveInput, setStaffActiveInput] = useState<'phone' | 'pin'>('phone');
  const [staffError, setStaffError] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

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

  const clearStaff = () => {
    setStaffPhone(DEFAULT_STAFF_PHONE);
    setStaffPin(DEFAULT_STAFF_PIN);
    setStaffActiveInput('phone');
    setStaffError('');
  };

  useFocusEffect(
    useCallback(() => {
      clearPhone();
      clearStaff();
      setActiveTab('customer');
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
        const resolvedCustomerId = response.data.customer.customerId || response.data.customer._id || '';
        const checkinResponse = await apiClient.post<CheckInResponse>('/checkin', {
          businessId: APP_CONFIG.businessId,
          storeId: APP_CONFIG.storeId,
          customerId: String(resolvedCustomerId),
          phone: response.data.customer.phone || phone.replace(/\D/g, ''),
        });

        setSuccessMessage('Welcome back! You are checked in.');
        const totalVisits = (checkinResponse.data.customer?.statistics?.totalVisits || response.data.customer.statistics?.totalVisits || 0) + 1;
        router.push({
          pathname: '/welcome',
          params: {
            firstName: response.data.customer.firstName,
            lastVisit: response.data.lastCheckinAt || '',
            totalVisits: String(totalVisits),
            customerId: String(resolvedCustomerId),
            phone: response.data.customer.phone || '',
            checkinMessage: checkinResponse.data.message || 'Check-in complete!',
            checkedInAt: checkinResponse.data.checkin?.checkedInAt || new Date().toISOString(),
          },
        });
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

  const handleStaffPhoneChange = (value: string) => {
    setStaffPhone(formatStaffPhone(value));
    if (staffError) setStaffError('');
  };

  const handleStaffPinChange = (value: string) => {
    const pin = value.replace(/\D/g, '').slice(0, 8);
    setStaffPin(pin);
    if (staffError) setStaffError('');
  };

  const handleStaffKeyPress = (value: string | number) => {
    if (value === '⌫') {
      if (staffActiveInput === 'phone') {
        setStaffPhone((prev) => formatStaffPhone(prev.slice(0, -1)));
      } else {
        setStaffPin((prev) => prev.slice(0, -1));
      }
      if (staffError) setStaffError('');
      return;
    }

    if (staffActiveInput === 'phone') {
      setStaffPhone((prev) => formatStaffPhone(prev + String(value)));
      if (staffError) setStaffError('');
      return;
    }

    setStaffPin((prev) => (prev + String(value)).replace(/\D/g, '').slice(0, 8));
    if (staffError) setStaffError('');
  };

  const handleStaffContinue = async () => {
    setStaffLoading(true);
    setStaffError('');

    try {
      await apiClient.post<StaffAuthResponse>('/checkin/staff/auth', {
        businessId: APP_CONFIG.businessId,
        storeId: APP_CONFIG.storeId,
        phone: staffPhone,
        pin: staffPin,
      });

      router.push('/TodayCustomerList');
    } catch (err: any) {
      setStaffError(err?.response?.data?.message || 'Invalid phone or PIN');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    tabContentAnim.setValue(0);
    Animated.timing(tabContentAnim, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabContentAnim]);

  const contentAnimatedStyle = {
    opacity: tabContentAnim,
    transform: [
      {
        translateY: tabContentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{APP_CONFIG.storeName}</Text>
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabButton, activeTab === 'customer' && styles.tabButtonActive]}
            onPress={() => setActiveTab('customer')}
          >
            <Text style={[styles.tabLabel, activeTab === 'customer' && styles.tabLabelActive]}>
              Customer
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'staff' && styles.tabButtonActive]}
            onPress={() => setActiveTab('staff')}
          >
            <Text style={[styles.tabLabel, activeTab === 'staff' && styles.tabLabelActive]}>
              Staff
            </Text>
          </Pressable>
        </View>

        <Animated.View style={contentAnimatedStyle}>
          {activeTab === 'customer' ? (
            <>
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
            </>
          ) : (
            <>
            <Text style={styles.subtitle}>Staff sign in</Text>

            <TextInput
              value={staffPhone}
              onChangeText={handleStaffPhoneChange}
              placeholder="Staff phone (555) 123-4567"
              keyboardType="phone-pad"
              maxLength={12}
              onFocus={() => setStaffActiveInput('phone')}
            />

            <TextInput
              value={staffPin}
              onChangeText={handleStaffPinChange}
              placeholder="PIN"
              keyboardType="number-pad"
              maxLength={8}
              secureTextEntry
              onFocus={() => setStaffActiveInput('pin')}
            />

            {staffError ? <Text style={styles.error}>{staffError}</Text> : null}

            <View style={styles.keypad}>
              {keypad.map((item) => (
                <View key={`staff-${item}`} style={styles.keypadItem}>
                  <Button title={String(item)} onPress={() => handleStaffKeyPress(item)} />
                </View>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.actionButton}>
                <Button
                  title="Clear"
                  onPress={clearStaff}
                  disabled={!staffPhone && !staffPin}
                />
              </View>
              <View style={styles.actionButton}>
                <Button
                  title="Continue"
                  onPress={handleStaffContinue}
                  loading={staffLoading}
                />
              </View>
            </View>
            </>
          )}
        </Animated.View>
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FDEDF6',
    borderRadius: 14,
    padding: 4,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#2F2F2F',
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
