import { Stack } from 'expo-router';
import { ReportByStoreScreen } from '../src/screens/ReportByStoreScreen';

export default function ReportByStoreRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Report By Store' }} />
      <ReportByStoreScreen />
    </>
  );
}
