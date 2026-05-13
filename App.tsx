import { Anton_400Regular } from '@expo-google-fonts/anton';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TrickPicker } from './src/screens/TrickPicker';
import { MatchProvider, useMatch } from './src/store/MatchContext';
import { colors } from './src/theme/tokens';
import { GrainLayer } from './src/ui/GrainLayer';

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
      {/* Paper bg lives outside MatchProvider so it covers the brief
          hydration window where the provider renders nothing. */}
      <View style={{ flex: 1, backgroundColor: colors.paper }}>
        <MatchProvider>
          <ActiveScreen />
          <GrainLayer />
          <TrickPicker />
        </MatchProvider>
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
