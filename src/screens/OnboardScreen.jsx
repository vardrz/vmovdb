import { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import COLORS from '@/src/constants/colors';
import { useNavigation } from '@react-navigation/native';

export default function OnboardScreen() {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View style={styles.bg}>
      <Image
        source={require('@/assets/images/onboard.jpg')}
        style={styles.imageBg}
      />
      <LinearGradient
        colors={COLORS.gradients.backgroundOverlay}
        style={styles.background}
      />
      <View style={styles.content}>
        <Image 
          source={require('@/assets/images/logo.png')}
          style={{
            width: "30%",
            height: "30%",
            aspectRatio: 1,
            marginBottom: "50%",
          }}
        />

        <Text style={styles.title}>
          Welcome to VMovDB
        </Text>

        <PagerView 
          style={styles.sliderContainer} 
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          <View style={styles.slide} key={1}>
            <Text style={styles.subTitle}>
              Find your favorite movies and TV shows
            </Text>
          </View>
          <View style={styles.slide} key={2}>
            <Text style={styles.subTitle}>
              Get personalized recommendations based on your taste
            </Text>
          </View>
          <View style={styles.slide} key={3}>
            <Text style={styles.subTitle}>
              Stay updated with the latest releases and trending content
            </Text>
          </View>
        </PagerView>

        <View style={styles.paginationDots}>
          {[0, 1, 2].map((dot, index) => (
            <View
              key={index}
              style={{
                width: 10,
                height: 10,
                borderRadius: "100%",
                marginHorizontal: 5,
                backgroundColor: currentPage === index ? COLORS.primary : COLORS.white
              }}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Main')}
          style={{width: '100%'}}
        >
          <LinearGradient
            start={[0, 1]}
            end={[1, 0]}
            colors={COLORS.gradients.primaryButton}
            style={styles.button}
          >
            <Text style={styles.text}>Explore</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bg: {
    backgroundColor: COLORS.background,
    flex: 1,
    position: 'relative',
  },
  imageBg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingBottom: 50,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    width: "100%",
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20
  },
  text: {
    backgroundColor: 'transparent',
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
  },
  sliderContainer: {
    width: '100%',
    height: 80,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
})