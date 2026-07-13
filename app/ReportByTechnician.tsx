import { Stack } from 'expo-router';
import { ReportByTechnicianScreen } from '../src/screens/ReportByTechnicianScreen';

export default function ReportByTechnicianRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Report By Technician' }} />
      <ReportByTechnicianScreen />
    </>
  );
}
