import { Stack } from 'expo-router';
import { WelcomeScreen } from '../src/screens/WelcomeScreen';

export default function WelcomeRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Welcome' }} />
      <WelcomeScreen />
    </>
  );
}
