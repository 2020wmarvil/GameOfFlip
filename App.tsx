import { Anton_400Regular } from '@expo-google-fonts/anton';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { MatchProvider, useMatch } from './src/store/MatchContext';

function ActiveScreen() {
  const { state } = useMatch();
  switch (state.screen) {
    case 'home':
      return <HomeScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'match':
      return <MatchScreen />;
    case 'gameover':
      return <GameOverScreen />;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <MatchProvider>
        <ActiveScreen />
        <StatusBar style="light" />
      </MatchProvider>
    </SafeAreaProvider>
  );
}
