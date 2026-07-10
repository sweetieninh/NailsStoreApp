import React from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, View } from 'react-native';

type Props = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

export const TextInput = ({ value, onChangeText, ...props }: Props) => {
  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
