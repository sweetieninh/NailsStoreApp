import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { StoreReportResponse, StoreReportType } from '../types';

const REPORT_TYPE_OPTIONS: Array<{ label: string; value: StoreReportType }> = [
  { label: "Today's report", value: 'today' },
  { label: 'This week report', value: 'week' },
  { label: 'This month report', value: 'month' },
  { label: 'Custom dates report', value: 'custom' },
];

const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

export const ReportByStoreScreen = () => {
  const [reportType, setReportType] = useState<StoreReportType>('today');
  const [showDetails, setShowDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<StoreReportResponse | null>(null);

  const dateInputPlaceholder = useMemo(() => 'YYYY-MM-DD', []);

  const showReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.get<StoreReportResponse>('/checkin/reports/store', {
        params: {
          businessId: APP_CONFIG.businessId,
          storeId: APP_CONFIG.storeId,
          reportType,
          showDetails,
          startDate: reportType === 'custom' ? startDate : undefined,
          endDate: reportType === 'custom' ? endDate : undefined,
        },
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load store report.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{APP_CONFIG.storeName}</Text>

        <Text style={styles.label}>Report Type</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={reportType} onValueChange={(value) => setReportType(value as StoreReportType)}>
            {REPORT_TYPE_OPTIONS.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => setShowDetails((previous) => !previous)}>
          <Text style={styles.checkbox}>{showDetails ? '☑' : '☐'}</Text>
          <Text style={styles.checkboxLabel}>Show Details</Text>
        </Pressable>

        {reportType === 'custom' ? (
          <View style={styles.customDateWrap}>
            <Text style={styles.label}>Start Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.currentTarget.value)}
                style={styles.webDateInput as any}
              />
            ) : (
              <RNTextInput
                style={styles.nativeDateInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder={dateInputPlaceholder}
              />
            )}

            <Text style={styles.label}>End Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.currentTarget.value)}
                style={styles.webDateInput as any}
              />
            ) : (
              <RNTextInput
                style={styles.nativeDateInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder={dateInputPlaceholder}
              />
            )}
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Show Report" onPress={showReport} loading={loading} />

        {reportData ? (
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Report Result</Text>
            <Text style={styles.reportRange}>
              Range: {formatDateTime(reportData.from)} - {formatDateTime(reportData.to)}
            </Text>
            <Text style={styles.total}>Total Checkout Amount: {formatCurrency(reportData.totalAmount)}</Text>

            {showDetails ? (
              <View style={styles.detailsWrap}>
                {reportData.technicianBreakdown.length ? (
                  reportData.technicianBreakdown.map((item) => (
                    <View key={item.technicianId} style={styles.detailRow}>
                      <Text style={styles.detailName}>
                        {item.firstName} {item.lastName}
                      </Text>
                      <Text style={styles.detailAmount}>{formatCurrency(item.subtotal)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.empty}>No technician details for this report range.</Text>
                )}
              </View>
            ) : null}
          </View>
        ) : null}
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
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#F3D4E6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF9FD',
    marginBottom: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  checkbox: {
    fontSize: 16,
    color: '#374151',
    width: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  customDateWrap: {
    gap: 8,
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2F2F2F',
    backgroundColor: '#FFFFFF',
  },
  nativeDateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2F2F2F',
    backgroundColor: '#FFFFFF',
  },
  reportCard: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#F3D4E6',
    borderRadius: 14,
    backgroundColor: '#FFF9FD',
    padding: 12,
    gap: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  reportRange: {
    fontSize: 13,
    color: '#6B7280',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F2F2F',
  },
  detailsWrap: {
    gap: 6,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailName: {
    fontSize: 14,
    color: '#374151',
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2F2F',
  },
  error: {
    color: '#D14343',
    fontSize: 13,
  },
  empty: {
    fontSize: 13,
    color: '#6B7280',
  },
});
