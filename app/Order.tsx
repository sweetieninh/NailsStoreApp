import { Stack } from 'expo-router';
import { OrderScreen } from '../src/screens/OrderScreen';

export default function OrderRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Order' }} />
      <OrderScreen />
    </>
  );
}
