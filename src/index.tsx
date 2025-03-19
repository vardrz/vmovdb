import AppNavigator from "../src/navigations/AppNavigator";
import { StatusBar, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  return (
    <>
      <StatusBar backgroundColor="#00000000" barStyle="light-content" translucent />

      {/* Top gradient overlay */}
      <LinearGradient
        colors={["#00000080", 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    zIndex: 10,
  }
});
