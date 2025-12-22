
import { Redirect } from 'expo-router';

export default function Index() {
  console.log('Index screen rendering - redirecting to tracks');
  return <Redirect href="/(tabs)/tracks" />;
}
