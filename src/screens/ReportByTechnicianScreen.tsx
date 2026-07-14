import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { APP_CONFIG } from '../constants/app';
import { apiClient } from '../api/client';
import { StoreReportResponse, StoreReportTreeNode, StoreReportType, TechniciansResponse } from '../types';

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

export const ReportByTechnicianScreen = () => {
  const [reportType, setReportType] = useState<StoreReportType>('today');
  const [technicians, setTechnicians] = useState<Array<{ id: string; fullName: string }>>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<StoreReportResponse | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);

  const dateInputPlaceholder = useMemo(() => 'YYYY-MM-DD', []);

  useEffect(() => {
    const loadTechnicians = async () => {
      setLoadingTechs(true);
      setError('');
      try {
        const response = await apiClient.get<TechniciansResponse>('/checkin/technicians', {
          params: {
            businessId: APP_CONFIG.businessId,
            storeId: APP_CONFIG.storeId,
          },
        });

        const list = (response.data.technicians || []).map((tech) => ({
          id: tech.id,
          fullName: `${tech.firstName} ${tech.lastName}`.trim(),
        }));

        setTechnicians(list);
        if (list.length) {
          setSelectedTechnicianId((current) => current || list[0].id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load technicians.');
      } finally {
        setLoadingTechs(false);
      }
    };

    void loadTechnicians();
  }, []);

  useEffect(() => {
    const loadReport = async () => {
      if (!selectedTechnicianId) {
        return;
      }

      if (reportType === 'custom' && (!startDate || !endDate)) {
        setReportData(null);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await apiClient.get<StoreReportResponse>('/checkin/reports/technician', {
          params: {
            businessId: APP_CONFIG.businessId,
            storeId: APP_CONFIG.storeId,
            technicianId: selectedTechnicianId,
            reportType,
            startDate: reportType === 'custom' ? startDate : undefined,
            endDate: reportType === 'custom' ? endDate : undefined,
          },
        });

        setReportData(response.data);
        setExpandedNodeIds((response.data.tree || []).map((node) => node.id));
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load technician report.');
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [selectedTechnicianId, reportType, startDate, endDate]);

  const toggleNode = (id: string) => {
    setExpandedNodeIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id);
      }
      return [...current, id];
    });
  };

  const formatNodeAmount = (node: StoreReportTreeNode) => {
    const amountText = formatCurrency(node.subtotal);
    if (node.nodeType === 'service') {
      return `${node.label} (${amountText})`;
    }
    if (node.nodeType === 'month' || node.nodeType === 'today') {
      return `${node.label}: Total ${amountText}`;
    }
    return `${node.label} (Subtotal: ${amountText})`;
  };

  const renderTreeNode = (node: StoreReportTreeNode, level: number) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodeIds.includes(node.id);

    return (
      <View key={node.id}>
        <Pressable
          style={[styles.treeRow, { paddingLeft: 10 + level * 16 }]}
          onPress={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
          }}
        >
          <Text style={styles.treeIndicator}>{hasChildren ? (isExpanded ? '▾' : '▸') : '•'}</Text>
          <Text style={[styles.treeText, node.nodeType === 'month' || node.nodeType === 'today' ? styles.treeTopText : null]}>
            {formatNodeAmount(node)}
          </Text>
        </Pressable>

        {hasChildren && isExpanded
          ? node.children.map((child) => renderTreeNode(child, level + 1))
          : null}
      </View>
    );
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

        <Text style={styles.label}>Technician</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedTechnicianId}
            onValueChange={(value) => setSelectedTechnicianId(String(value))}
          >
            {technicians.map((tech) => (
              <Picker.Item key={tech.id} label={tech.fullName} value={tech.id} />
            ))}
          </Picker>
        </View>

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

        {loadingTechs ? <Text style={styles.empty}>Loading technicians...</Text> : null}
        {loading ? <Text style={styles.empty}>Loading report...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {reportData ? (
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Report Result</Text>
            <Text style={styles.reportRange}>
              Range: {formatDateTime(reportData.from)} - {formatDateTime(reportData.to)}
            </Text>
            <Text style={styles.total}>Total Checkout Amount: {formatCurrency(reportData.totalAmount)}</Text>

            {reportData.tree.length ? (
              <View style={styles.treeWrap}>{reportData.tree.map((node) => renderTreeNode(node, 0))}</View>
            ) : (
              <Text style={styles.empty}>No report records for this range.</Text>
            )}
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
  treeWrap: {
    gap: 6,
    marginTop: 4,
  },
  treeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  treeIndicator: {
    width: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  treeText: {
    fontSize: 14,
    color: '#374151',
    flexShrink: 1,
  },
  treeTopText: {
    fontWeight: '700',
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
