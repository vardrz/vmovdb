import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import OnboardScreen from "../screens/OnboardScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import COLORS from "../constants/colors";
import MovieDetailScreen from "../screens/MovieDetailScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const hasCompletedOnboarding = false; // todo: check if onboarded

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <StatusBar backgroundColor={COLORS.black} barStyle="light-content" translucent />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboard" component={OnboardScreen} />
          ) : null}
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default AppNavigator;
