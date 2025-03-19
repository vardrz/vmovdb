import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { movieAPI } from '../services/api';
import Movie from '../models/Movie';
import TvSeries from '../models/TvSeries';
import COLORS from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const MediaListScreen = ({ route, navigation }) => {
  const { title, type, endpoint, timeWindow } = route.params;
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMedia = async (pageNum = 1, refresh = false) => {
    if (loadingMore && !refresh) return;
    
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      let data;
      
      // Fetch data based on endpoint and type
      if (endpoint === 'trending') {
        if (type === 'movie') {
          data = await movieAPI.getTrendingMovies(timeWindow, pageNum);
        } else {
          data = await movieAPI.getTrendingTvSeries(timeWindow, pageNum);
        }
      } else if (endpoint === 'top-rated') {
        if (type === 'movie') {
          data = await movieAPI.getTopRatedMovies(pageNum);
        } else {
          data = await movieAPI.getTopRatedTvSeries(pageNum);
        }
      }
      
      if (!data || !data.results) {
        throw new Error('Failed to fetch data');
      }
      
      // Convert API responses to Movie or TvSeries objects
      const results = data.results.map(item => 
        type === 'movie' ? new Movie(item) : new TvSeries(item)
      );
      
      if (refresh || pageNum === 1) {
        setMedia(results);
      } else {
        setMedia(prevMedia => [...prevMedia, ...results]);
      }
      
      setPage(pageNum);
      setHasMore(data.page < data.total_pages);
      
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleRefresh = () => {
    fetchMedia(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchMedia(page + 1);
    }
  };

  const handleMediaPress = (item) => {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else {
      navigation.navigate('TVDetail', { tvId: item.id });
    }
  };

  const renderItem = useCallback(({ item }) => {
    if (type === 'movie') {
      // Get release year from the release date
      const releaseYear = item.releaseDate ? item.releaseDate.split('-')[0] : '';
      
      return (
        <View style={styles.gridItem}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleMediaPress(item)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.getPosterUrl() }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.primary} />
                <Text style={styles.rating}>{item.getRatingPercentage()}</Text>
              </View>
              {releaseYear ? (
                <View style={styles.yearContainer}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.white} />
                  <Text style={styles.year}>{releaseYear}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      // Get first air year from the first air date
      const firstAirYear = item.firstAirDate ? item.firstAirDate.split('-')[0] : '';
      
      return (
        <View style={styles.gridItem}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => handleMediaPress(item)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.getPosterUrl() }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={COLORS.primary} />
                <Text style={styles.rating}>{item.getRatingPercentage()}</Text>
              </View>
              {firstAirYear ? (
                <View style={styles.yearContainer}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.white} />
                  <Text style={styles.year}>{firstAirYear}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  }, [type]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading && !refreshing && !loadingMore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(item, index) => `${type}-${item.id}-${index}`}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={6}
          maxToRenderPerBatch={4}
          windowSize={5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
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
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 16,
  },
  listContainer: {
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  card: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    aspectRatio: 2/3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 12,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  year: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '400',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  }
});

export default MediaListScreen;