import { Stack } from 'expo-router';
import { CheckInScreen } from '../src/screens/CheckInScreen';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Check In' }} />
      <CheckInScreen />
    </>
  );
}
