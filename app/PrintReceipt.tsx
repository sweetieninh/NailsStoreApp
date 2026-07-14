import { Stack } from 'expo-router';
import { PrintReceiptScreen } from '../src/screens/PrintReceiptScreen';

export default function PrintReceiptRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Print Receipt' }} />
      <PrintReceiptScreen />
    </>
  );
}
