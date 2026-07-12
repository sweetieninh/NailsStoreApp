import { Stack } from 'expo-router';
import { CustomerOrderScreen } from '../src/screens/CustomerOrderScreen';

export default function CustomerOrderRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Customer Order' }} />
      <CustomerOrderScreen />
    </>
  );
}
