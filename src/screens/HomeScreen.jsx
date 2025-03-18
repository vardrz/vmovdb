import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import Movie from '../models/Movie';
import COLORS from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTopRatedMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movieAPI.getTopRatedMovies();
      
      // Convert API response to Movie objects
      const movies = data.results.map(movie => new Movie(movie));
      
      // Set the first movie as featured
      if (movies.length > 0) {
        setFeaturedMovie(movies[Math.floor(Math.random() * movies.length)]);
      }
      
      // Set the rest as top rated
      setTopRatedMovies(movies);
    } catch (err) {
      console.error('Failed to fetch top rated movies:', err);
      setError('Failed to load movies. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopRatedMovies();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTopRatedMovies();
  };

  const handleMoviePress = (movie) => {
    // Navigate to movie details screen (to be implemented)
    // navigation.navigate('MovieDetails', { movieId: movie.id });
    console.log('Movie pressed:', movie.title);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Featured Movie Banner */}
        {featuredMovie && (
          <View style={styles.featuredContainer}>
            <Image 
              source={{ uri: featuredMovie.getBackdropUrl() }} 
              style={styles.featuredImage}
            />
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              colors={['transparent', 'transparent', COLORS.black]}
              style={styles.featuredGradient}
            />
            
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{featuredMovie.title}</Text>
              <View style={styles.buttonRow}>
                <View style={styles.smallButton}>
                  <View style={styles.buttonContent}>
                    <Ionicons name="star" size={14} color={COLORS.white} />
                    <Text style={styles.smallButtonText}>{featuredMovie.getRatingPercentage()}</Text>
                  </View>
                </View>
                <View style={styles.smallButton}>
                  <View style={styles.buttonContent}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
                    <Text style={styles.smallButtonText}>{featuredMovie.releaseDate.split('-')[0]}</Text>
                  </View>
                </View>
                <View style={styles.smallButton}>
                  <View style={styles.buttonContent}>
                    <Ionicons name="language" size={14} color={COLORS.white} />
                    <Text style={styles.smallButtonText}>{featuredMovie.language.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Top 10 Movies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top 10 Movies This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={topRatedMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MovieCard movie={item} onPress={handleMoviePress} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieList}
          />
        </View>

        {/* You can add more sections here for different movie categories */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
  },
  featuredContainer: {
    height: 450,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    minWidth: width / 4,
    alignItems: 'center',
  },
  smallButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
  },
  movieList: {
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    alignSelf: 'center',
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default HomeScreen;