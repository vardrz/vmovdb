import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { movieAPI } from '../services/api';
import Movie from '../models/Movie';
import COLORS from '../constants/colors';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searching, setSearching] = useState(false);

  // Update the handleSearch function to add a debounce effect and ensure proper API call
  const handleSearch = async (searchQuery, newSearch = true) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (newSearch) {
        setSearching(true);
        setPage(1);
      }
      
      const currentPage = newSearch ? 1 : page;
      console.log(`Searching for: "${searchQuery}" on page ${currentPage}`); // Debug log
      
      const data = await movieAPI.searchMovies(searchQuery, currentPage);
      
      // Convert API response to Movie objects
      const movies = data.results
        .filter(item => (item.media_type == "tv" || item.media_type == "movie"))
        .map(movie => new Movie(movie));
      
      
      if (newSearch) {
        setSearchResults(movies);
      } else {
        setSearchResults(prevResults => [...prevResults, ...movies]);
      }
      
      setTotalPages(data.total_pages);
      setPage(currentPage + 1);
    } catch (err) {
      console.error('Failed to search movies:', err);
      setError('Failed to search movies. Please try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Add useEffect to trigger search when query changes (with debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Update the TextInput to not trigger search on submit, since we're using the useEffect
  <TextInput
    style={styles.searchInput}
    placeholder="Search for movies..."
    placeholderTextColor={COLORS.textSecondary}
    value={query}
    onChangeText={setQuery}
    returnKeyType="search"
    autoCapitalize="none"
  />
  const handleLoadMore = () => {
    if (loading || page > totalPages) return;
    handleSearch(query, false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setPage(1);
    setTotalPages(0);
  };

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => {
        item.media_type === "tv"
        ? navigation.navigate('TVDetail', { tvId: item.id })
        : navigation.navigate('MovieDetail', { movieId: item.id });
      }}
    >
      <Image
        source={item.getPosterUrl() ? { uri: item.getPosterUrl() } : require('../../assets/images/no-image.jpg')}
        style={styles.moviePoster}
        resizeMode="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={3}>{item.title}</Text>
        <Text style={styles.movieDate}>{item.getFormattedReleaseDate()}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={COLORS.primary} />
          <Text style={styles.ratingText}>{item.getRatingPercentage()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || searchResults.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading && searchResults.length === 0) return null;
    
    return (
      <View style={styles.emptyContainer}>
        {query.length > 0 ? (
          <>
            <Ionicons name="search-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No movies found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </>
        ) : (
          <>
            <Ionicons name="film-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Search for movies</Text>
            <Text style={styles.emptySubtext}>Enter a movie title above</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for movies..."
            placeholderTextColor={COLORS.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {searching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchingText: {
    color: COLORS.white,
    marginLeft: 10,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  movieItem: {
    flexDirection: 'row',
    marginBottom: 20,
    overflow: 'hidden',
    padding: 5
  },
  moviePoster: {
    width: 100,
    height: 150,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
  },
  movieTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  movieDate: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 14,
  },
  movieOverview: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },
});

export default SearchScreen;