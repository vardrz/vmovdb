import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import OnboardScreen from "../screens/OnboardScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import MovieDetailScreen from "../screens/MovieDetailScreen";
import TvSeriesDetailScreen from "../screens/TvSeriesDetailScreen";
import EpisodeDetailScreen from "../screens/EpisodeDetailScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const hasCompletedOnboarding = false; // todo: check if onboarded

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboard" component={OnboardScreen} />
          ) : null}
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TVDetail" component={TvSeriesDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EpisodeDetail" component={EpisodeDetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default AppNavigator;
