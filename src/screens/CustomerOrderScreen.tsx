import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput as RNTextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { apiClient } from '../api/client';
import { Button } from '../components/Button';
import { APP_CONFIG } from '../constants/app';
import {
  InventoryItem,
  InventoryResponse,
  ServiceTypeItem,
  ServiceTypesResponse,
  Technician,
  TechniciansResponse,
} from '../types';

export const CustomerOrderScreen = () => {
  const params = useLocalSearchParams<{ customerId?: string; firstName?: string; lastName?: string }>();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<string[]>([]);
  const [nailArtCustomPrice, setNailArtCustomPrice] = useState('0');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const customerFullName = useMemo(() => {
    const firstName = params.firstName || '';
    const lastName = params.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Customer';
  }, [params.firstName, params.lastName]);

  const loadScreenData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [techniciansResponse, inventoryResponse, serviceTypesResponse] = await Promise.all([
        apiClient.get<TechniciansResponse>('/checkin/technicians', {
          params: {
            businessId: APP_CONFIG.businessId,
            storeId: APP_CONFIG.storeId,
          },
        }),
        apiClient.get<InventoryResponse>('/checkin/inventory', {
          params: {
            businessId: APP_CONFIG.businessId,
            storeId: APP_CONFIG.storeId,
          },
        }),
        apiClient.get<ServiceTypesResponse>('/checkin/service-types', {
          params: {
            businessId: APP_CONFIG.businessId,
            storeId: APP_CONFIG.storeId,
          },
        }),
      ]);

      const techniciansList = techniciansResponse.data.technicians || [];
      setTechnicians(techniciansList);
      if (techniciansList.length > 0) {
        setSelectedTechnicianId((current) => current || techniciansList[0].id);
      }

      setInventoryItems(inventoryResponse.data.items || []);
      setServiceTypes(serviceTypesResponse.data.services || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load customer order data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const groupedInventory = useMemo(() => {
    const groups = new Map<string, InventoryItem[]>();
    inventoryItems.forEach((item) => {
      const key = item.category || 'Other';
      const existing = groups.get(key) || [];
      existing.push(item);
      groups.set(key, existing);
    });

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [inventoryItems]);

  const serviceRows = useMemo(() => {
    const rows: ServiceTypeItem[][] = [];
    for (let index = 0; index < serviceTypes.length; index += 3) {
      rows.push(serviceTypes.slice(index, index + 3));
    }
    return rows;
  }, [serviceTypes]);

  const totalAmount = useMemo(() => {
    const selectedInventory = new Set(selectedInventoryIds);
    const inventoryTotal = inventoryItems.reduce((sum, item) => {
      if (!selectedInventory.has(item.id)) return sum;
      return sum + Number(item.unitCost || 0);
    }, 0);

    const selectedServices = new Set(selectedServiceIds);
    const parsedNailArt = Number.parseFloat(nailArtCustomPrice || '0');
    const nailArtPrice = Number.isFinite(parsedNailArt) ? parsedNailArt : 0;
    const servicesTotal = serviceTypes.reduce((sum, item) => {
      if (!selectedServices.has(item.id)) return sum;
      if (item.serviceType === 'Nail Art') {
        return sum + nailArtPrice;
      }
      return sum + Number(item.price || 0);
    }, 0);

    return inventoryTotal + servicesTotal;
  }, [inventoryItems, nailArtCustomPrice, selectedInventoryIds, selectedServiceIds, serviceTypes]);

  const toggleServiceItem = (id: string) => {
    setSelectedServiceIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((itemId) => itemId !== id);
      }
      return [...previous, id];
    });
  };

  const toggleInventoryItem = (id: string) => {
    setSelectedInventoryIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((itemId) => itemId !== id);
      }
      return [...previous, id];
    });
  };

  const handleAddToCart = () => {};
  const handleCheckout = () => {};

  useFocusEffect(
    useCallback(() => {
      void loadScreenData();
    }, [loadScreenData])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{customerFullName}</Text>

        <Text style={styles.label}>Technician</Text>
        {loading ? <ActivityIndicator color="#2F2F2F" /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedTechnicianId}
            onValueChange={(value) => setSelectedTechnicianId(String(value))}
          >
            {technicians.map((tech) => (
              <Picker.Item
                key={tech.id}
                label={`${tech.firstName} ${tech.lastName}`.trim()}
                value={tech.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Service</Text>
        <View style={styles.serviceGrid}>
          {serviceRows.map((row, rowIndex) => (
            <View key={`service-row-${rowIndex}`} style={styles.serviceRow}>
              {row.map((item) => {
                const checked = selectedServiceIds.includes(item.id);
                const isNailArt = item.serviceType === 'Nail Art';
                return (
                  <Pressable
                    key={item.id}
                    style={styles.serviceCell}
                    onPress={() => toggleServiceItem(item.id)}
                  >
                    <View style={styles.serviceHeader}>
                      <Text style={styles.checkbox}>{checked ? '☑' : '☐'}</Text>
                      <Text style={styles.serviceName}>{item.serviceType}</Text>
                    </View>
                    {isNailArt ? (
                      <RNTextInput
                        style={styles.nailArtInput}
                        value={nailArtCustomPrice}
                        onChangeText={(value) => setNailArtCustomPrice(value.replace(/[^0-9.]/g, ''))}
                        placeholder="Custom price"
                        keyboardType="decimal-pad"
                      />
                    ) : (
                      <Text style={styles.servicePrice}>${Number(item.price || 0).toFixed(2)}</Text>
                    )}
                  </Pressable>
                );
              })}
              {row.length < 3
                ? Array.from({ length: 3 - row.length }).map((_, index) => (
                    <View key={`service-empty-${rowIndex}-${index}`} style={styles.serviceCellEmpty} />
                  ))
                : null}
            </View>
          ))}
        </View>

        <Text style={styles.label}>Inventory</Text>
        {groupedInventory.map((group) => (
          <View key={group.category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{group.category}</Text>
            {group.items.map((item) => {
              const checked = selectedInventoryIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={styles.inventoryRow}
                  onPress={() => toggleInventoryItem(item.id)}
                >
                  <Text style={styles.checkbox}>{checked ? '☑' : '☐'}</Text>
                  <Text style={styles.inventoryText}>
                    {item.itemName}, ${Number(item.unitCost || 0).toFixed(2)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        {!loading && groupedInventory.length === 0 ? (
          <Text style={styles.empty}>No active inventory for this store.</Text>
        ) : null}

        <Text style={styles.totalAmount}>Total Amount: ${totalAmount.toFixed(2)}</Text>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <Button title="Add to Cart" onPress={handleAddToCart} />
          </View>
          <View style={styles.actionButton}>
            <Button title="Checkout" onPress={handleCheckout} />
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
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  pickerWrap: {
    alignSelf: 'flex-start',
    width: '72%',
    minWidth: 220,
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#F3D4E6',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF9FD',
  },
  serviceGrid: {
    gap: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  serviceCell: {
    flex: 1,
    minHeight: 84,
    borderWidth: 1,
    borderColor: '#F3D4E6',
    borderRadius: 12,
    backgroundColor: '#FFF9FD',
    padding: 8,
    gap: 6,
  },
  serviceCellEmpty: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },
  servicePrice: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 22,
  },
  nailArtInput: {
    marginLeft: 22,
    borderWidth: 1,
    borderColor: '#E8C9DA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: '#2F2F2F',
    backgroundColor: '#FFFFFF',
  },
  error: {
    color: '#D14343',
    fontSize: 13,
  },
  categoryBlock: {
    gap: 8,
    marginTop: 4,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  inventoryRow: {
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
  inventoryText: {
    fontSize: 14,
    color: '#4B5563',
  },
  totalAmount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#2F2F2F',
  },
  empty: {
    color: '#6B7280',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
