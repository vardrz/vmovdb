import React, { useState, useEffect, useCallback } from 'react';
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
import TvSeriesCard from '../components/TvSeriesCard';
import Movie from '../models/Movie';
import TvSeries from '../models/TvSeries';
import COLORS from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTvSeries, setTrendingTvSeries] = useState([]);
  const [topRatedTvSeries, setTopRatedTvSeries] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Use memoized render functions to prevent unnecessary re-renders
  const renderMovieCard = useCallback(({ item }) => (
    <MovieCard 
      key={`movie-${item.id}`}
      movie={item} 
      onPress={handleMoviePress} 
    />
  ), []);

  const renderTvSeriesCard = useCallback(({ item }) => (
    <TvSeriesCard 
      key={`tv-${item.id}`}
      tvSeries={item} 
      onPress={handleTvSeriesPress} 
    />
  ), []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch movies and TV series data in parallel
      const [topRatedData, trendingData, trendingTvData, topRatedTvData] = await Promise.all([
        movieAPI.getTopRatedMovies(),
        movieAPI.getTrendingMovies(),
        movieAPI.getTrendingTvSeries(),
        movieAPI.getTopRatedTvSeries()
      ]);
      
      // Convert API responses to Movie and TvSeries objects
      const topRated = topRatedData.results.map(movie => new Movie(movie));
      const trending = trendingData.results.map(movie => new Movie(movie));
      const trendingTv = trendingTvData.results.map(tv => new TvSeries(tv));
      const topRatedTv = topRatedTvData.results.map(tv => new TvSeries(tv));
      
      // Set a trending movie as featured
      // Randomly choose between trending and top rated movies for featured movie
      const allMovies = [...trending, ...topRated];
      if (allMovies.length > 0) {
        setFeaturedMovie(allMovies[Math.floor(Math.random() * allMovies.length)]);
      }
      
      // Set all state updates at once to reduce render cycles
      setTopRatedMovies(topRated);
      setTrendingMovies(trending);
      setTrendingTvSeries(trendingTv);
      setTopRatedTvSeries(topRatedTv);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movieId: movie.id });
  };

  const handleTvSeriesPress = (tvSeries) => {
    navigation.navigate('TVDetail', { tvId: tvSeries.id });
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
              defaultSource={require('../../assets/images/no-image.jpg')}
            />
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              colors={['transparent', 'transparent', COLORS.black]}
              style={styles.featuredGradient}
            />
            
            <View style={styles.featuredInfo}>
              <TouchableOpacity onPress={() => handleMoviePress(featuredMovie)}>
                <Text style={styles.featuredTitle}>{featuredMovie.title}</Text>
              </TouchableOpacity>
              <Text style={styles.overview}>
                {featuredMovie.overview.length > 150 
                  ? `${featuredMovie.overview.substring(0, 130)}...` 
                  : featuredMovie.overview}
              </Text>
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

        {/* Trending Movies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Movies This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={trendingMovies}
            keyExtractor={(item) => `trending-movie-${item.id.toString()}`}
            renderItem={renderMovieCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieList}
            removeClippedSubviews={false}
            initialNumToRender={5}
          />
        </View>

        {/* Trending TV Series */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending TV Series This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={trendingTvSeries}
            keyExtractor={(item) => `trending-tv-${item.id.toString()}`}
            renderItem={renderTvSeriesCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieList}
            removeClippedSubviews={false}
            initialNumToRender={5}
          />
        </View>

        {/* Top Rated Movies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Movies</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={topRatedMovies}
            keyExtractor={(item) => `top-rated-movie-${item.id.toString()}`}
            renderItem={renderMovieCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieList}
            removeClippedSubviews={false}
            initialNumToRender={5}
          />
        </View>

        {/* Top Rated TV Series */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated TV Series</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={topRatedTvSeries}
            keyExtractor={(item) => `top-rated-tv-${item.id.toString()}`}
            renderItem={renderTvSeriesCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movieList}
            removeClippedSubviews={false}
            initialNumToRender={5}
          />
        </View>
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
    marginBottom: 20,
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
  overview: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    maxWidth: '80%',
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
    textAlign: 'center',
    maxWidth: '80%',
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
    marginBottom: 20,
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