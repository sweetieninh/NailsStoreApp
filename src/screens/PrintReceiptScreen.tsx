import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { jsPDF } from 'jspdf';

type ReceiptService = {
  serviceType: string;
  price: number;
};

const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

export const PrintReceiptScreen = () => {
  const params = useLocalSearchParams<{
    storeName?: string;
    customerFirstName?: string;
    customerLastName?: string;
    services?: string;
    tipAmount?: string;
    totalAmount?: string;
    printedAt?: string;
  }>();

  const services = useMemo(() => {
    if (!params.services) {
      return [] as ReceiptService[];
    }

    try {
      const parsed = JSON.parse(params.services);
      if (!Array.isArray(parsed)) {
        return [] as ReceiptService[];
      }

      return parsed.map((item) => ({
        serviceType: String(item?.serviceType || 'Service'),
        price: Number(item?.price || 0),
      }));
    } catch {
      return [] as ReceiptService[];
    }
  }, [params.services]);

  const customerName = `${params.customerFirstName || ''} ${params.customerLastName || ''}`.trim();
  const printedDate = params.printedAt ? new Date(params.printedAt) : new Date();
  const tipAmount = Number(params.tipAmount || 0);
  const totalAmount = Number(params.totalAmount || 0);

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    }
  };

  const handlePrintPdf = () => {
    if (Platform.OS !== 'web') {
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    let y = 52;
    const lineHeight = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(params.storeName || 'Store', 40, y);

    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(printedDate.toLocaleString(), 40, y);

    y += lineHeight;
    doc.text(`CustomerName: ${customerName || 'Customer'}`, 40, y);

    y += lineHeight + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Services', 40, y);

    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    if (services.length) {
      services.forEach((service) => {
        doc.text(service.serviceType, 40, y);
        doc.text(formatCurrency(service.price), 520, y, { align: 'right' });
        y += lineHeight;
      });
    } else {
      doc.text('No selected services', 40, y);
      y += lineHeight;
    }

    doc.text('Tips', 40, y);
    doc.text(formatCurrency(tipAmount), 520, y, { align: 'right' });

    y += lineHeight + 4;
    doc.setDrawColor(160, 160, 160);
    doc.line(40, y, 520, y);

    y += lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Total Amount', 40, y);
    doc.text(formatCurrency(totalAmount), 520, y, { align: 'right' });

    const stamp = printedDate.toISOString().slice(0, 10);
    doc.save(`receipt-${stamp}.pdf`);
  };
  const handleTextReceipt = () => {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.storeName}>{params.storeName || 'Store'}</Text>
        <Text style={styles.meta}>{printedDate.toLocaleString()}</Text>

        <View style={styles.separator} />

        <Text style={styles.line}>CustomerName: {customerName || 'Customer'}</Text>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Services:</Text>
        {services.length ? (
          services.map((service, index) => (
            <View key={`${service.serviceType}-${index}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{service.serviceType}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(service.price)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.line}>No selected services</Text>
        )}

        <View style={styles.itemRow}>
          <Text style={styles.itemName}>Tips</Text>
          <Text style={styles.itemPrice}>{formatCurrency(tipAmount)}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button title="Print" onPress={handlePrint} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Print PDF" onPress={handlePrintPdf} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Text Receipt" onPress={handleTextReceipt} />
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
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  separator: {
    marginVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  line: {
    fontSize: 14,
    color: '#1F2937',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
