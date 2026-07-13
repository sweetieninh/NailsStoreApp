import { Stack } from 'expo-router';
import { ReportsScreen } from '../src/screens/ReportsScreen';

export default function ReportsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Reports' }} />
      <ReportsScreen />
    </>
  );
}
