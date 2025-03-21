import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Watchlist from '../models/Watchlist';
import COLORS from '../constants/colors';

const WatchlistScreen = ({ navigation }) => {
  const [watchlist, setWatchlist] = useState({ movies: [], tvSeries: [], episodes: [] });
  const [activeTab, setActiveTab] = useState('movies');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await Watchlist.getAll();
      setWatchlist(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh watchlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWatchlist();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWatchlist();
  };

  const handleRemoveItem = (id, type) => {
    Alert.alert(
      "Remove from Watchlist",
      "Are you sure you want to remove this item from your watchlist?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: async () => {
            if (type === 'movie') {
              await Watchlist.removeMovie(id);
            } else if (type === 'tv') {
              await Watchlist.removeTvSeries(id);
            } else if (type === 'episode') {
              await Watchlist.removeEpisode(id.tvId, id.seasonNumber, id.episodeNumber);
            }
            fetchWatchlist();
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleItemPress = (item, type) => {
    if (type === 'movie') {
      navigation.navigate('MovieDetail', { movieId: item.id });
    } else if (type === 'tv') {
      navigation.navigate('TVDetail', { tvId: item.id });
    } else if (type === 'episode') {
      navigation.navigate('EpisodeDetail', { 
        tvId: item.tvId,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        seriesName: item.seriesName,
        seasonName: item.seasonName
      });
    }
  };

  const renderMovieItem = ({ item }) => {
    const releaseYear = item.releaseDate ? item.releaseDate.split('-')[0] : '';
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item, 'movie')}
        activeOpacity={0.7}
      >
        <Image
          source={{ 
            uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` 
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.rating}>
                {item.voteAverage ? Number((item.voteAverage).toFixed(1)) : 'N/A'}
              </Text>
            </View>
            {releaseYear ? (
              <View style={styles.yearContainer}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
                <Text style={styles.year}>{releaseYear}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.addedDate}>
            Added: {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id, 'movie')}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderTvItem = ({ item }) => {
    const firstAirYear = item.firstAirDate ? item.firstAirDate.split('-')[0] : '';
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item, 'tv')}
        activeOpacity={0.7}
      >
        <Image
          source={{ 
            uri: `https://image.tmdb.org/t/p/w500${item.posterPath}` 
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.rating}>
                {item.voteAverage ? (item.voteAverage * 10).toFixed(0) + '%' : 'N/A'}
              </Text>
            </View>
            {firstAirYear ? (
              <View style={styles.yearContainer}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
                <Text style={styles.year}>{firstAirYear}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.addedDate}>
            Added: {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id, 'tv')}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEpisodeItem = ({ item }) => {
    const airDate = item.airDate ? new Date(item.airDate).toLocaleDateString() : 'Unknown';
    
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item, 'episode')}
        activeOpacity={0.7}
      >
        <Image
          source={{ 
            uri: item.stillPath 
              ? `https://image.tmdb.org/t/p/w500${item.stillPath}`
              : 'https://via.placeholder.com/500x281?text=No+Image' 
          }}
          style={styles.episodeStill}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.seriesTitle} numberOfLines={1}>{item.seriesName}</Text>
          <Text style={styles.title} numberOfLines={2}>
            S{item.seasonNumber} E{item.episodeNumber}: {item.name}
          </Text>
          <View style={styles.detailsRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.rating}>
                {item.voteAverage ? Number((item.voteAverage).toFixed(1)) : 'N/A'}
              </Text>
            </View>
            <View style={styles.yearContainer}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
              <Text style={styles.year}>{airDate}</Text>
            </View>
          </View>
          <Text style={styles.addedDate}>
            Added: {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item, 'episode')}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={
          activeTab === 'movies' 
            ? 'film-outline' 
            : activeTab === 'tvSeries' 
              ? 'tv-outline' 
              : 'play-circle-outline'
        } 
        size={60} 
        color={COLORS.white} 
      />
      <Text style={styles.emptyText}>
        Your watchlist is empty
      </Text>
      <Text style={styles.emptySubText}>
        {activeTab === 'movies' 
          ? 'Add movies to your watchlist to see them here'
          : activeTab === 'tvSeries'
            ? 'Add TV shows to your watchlist to see them here'
            : 'Add episodes to your watchlist to see them here'
        }
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Content</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'movies' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('movies')}
        >
          <Ionicons 
            name="film" 
            size={18} 
            color={activeTab === 'movies' ? COLORS.primary : COLORS.white} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'movies' && styles.activeTabText
            ]}
          >
            Movies ({watchlist.movies.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'tvSeries' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('tvSeries')}
        >
          <Ionicons 
            name="tv" 
            size={18} 
            color={activeTab === 'tvSeries' ? COLORS.primary : COLORS.white} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'tvSeries' && styles.activeTabText
            ]}
          >
            TV Series ({watchlist.tvSeries.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'episodes' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('episodes')}
        >
          <Ionicons 
            name="play-circle" 
            size={18} 
            color={activeTab === 'episodes' ? COLORS.primary : COLORS.white} 
          />
          <Text 
            style={[
              styles.tabText,
              activeTab === 'episodes' && styles.activeTabText
            ]}
          >
            Episodes ({watchlist.episodes ? watchlist.episodes.length : 0})
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'movies' 
              ? watchlist.movies 
              : activeTab === 'tvSeries' 
                ? watchlist.tvSeries 
                : watchlist.episodes || []
          }
          keyExtractor={(item) => `${activeTab}-${item.id || `${item.tvId}-${item.seasonNumber}-${item.episodeNumber}`}`}
          renderItem={
            activeTab === 'movies' 
              ? renderMovieItem 
              : activeTab === 'tvSeries' 
                ? renderTvItem 
                : renderEpisodeItem
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
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
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.black,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 14,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginBottom: 16,
    overflow: 'hidden',
  },
  poster: {
    width: 80,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 14,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  year: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 14,
  },
  addedDate: {
    color: COLORS.white,
    fontSize: 12,
  },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  episodeStill: {
    width: 80,
    height: 120,
  },
  seriesTitle: {
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 4,
  }
});

export default WatchlistScreen;