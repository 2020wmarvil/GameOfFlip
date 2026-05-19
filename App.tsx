import { Anton_400Regular } from '@expo-google-fonts/anton';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MatchScreen } from './src/screens/MatchScreen';
import { SendItScreen } from './src/screens/SendItScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { TrickPicker } from './src/screens/TrickPicker';
import { MatchProvider, useMatch } from './src/store/MatchContext';
import { TrickLibraryProvider } from './src/store/TrickLibraryContext';
import { colors } from './src/theme/tokens';
import { GrainLayer } from './src/ui/GrainLayer';

// Android hardware back. There's no navigation stack (screens are driven by
// state.screen), so without this the OS back button just exits the app.
// Each branch mirrors the on-screen back button for that screen.
// (Open modals are handled by RN's <Modal onRequestClose> and never reach
// this listener.)
function useHardwareBack() {
  const { state, dispatch } = useMatch();
  const screen = state.screen;
  useEffect(() => {
    const onBack = () => {
      switch (screen) {
        case 'setup':
          dispatch({ type: 'GOTO', screen: 'home' });
          return true;
        case 'sendit':
        case 'gameover':
          dispatch({ type: 'HOME' });
          return true;
        case 'match':
          Alert.alert('End match?', 'Your progress will be lost.', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'End match',
              style: 'destructive',
              onPress: () => dispatch({ type: 'HOME' }),
            },
          ]);
          return true;
        case 'home':
        default:
          return false; // root screen — let the OS exit the app
      }
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen, dispatch]);
}

function ActiveScreen() {
  const { state } = useMatch();
  useHardwareBack();
  switch (state.screen) {
    case 'home':
      return <HomeScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'match':
      return <MatchScreen />;
    case 'sendit':
      return <SendItScreen />;
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
        <TrickLibraryProvider>
          <MatchProvider>
            <ActiveScreen />
            <GrainLayer />
            <TrickPicker />
          </MatchProvider>
        </TrickLibraryProvider>
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
