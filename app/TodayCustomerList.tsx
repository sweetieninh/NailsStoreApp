import { Stack } from 'expo-router';
import { TodayCustomerListScreen } from '../src/screens/TodayCustomerListScreen';

export default function TodayCustomerListRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Today Customer List' }} />
      <TodayCustomerListScreen />
    </>
  );
}