import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
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
});
