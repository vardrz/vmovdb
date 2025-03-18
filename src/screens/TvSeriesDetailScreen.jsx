import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import { movieAPI } from '../services/api';
import TvSeries from '../models/TvSeries';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const TvSeriesDetailScreen = ({ route, navigation }) => {
  const { tvId } = route.params;
  const [tvSeries, setTvSeries] = useState(null);
  const [images, setImages] = useState({ backdrops: [], posters: [] });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const fetchTvData = async () => {
      try {
        setLoading(true);
        // Fetch TV series details, images, and videos in parallel
        const [tvData, imagesData, videosData] = await Promise.all([
          movieAPI.getTvDetails(tvId),
          movieAPI.getTvImages(tvId),
          movieAPI.getTvVideos(tvId)
        ]);
        
        setTvSeries(new TvSeries(tvData));
        setImages(imagesData);
        
        // Filter videos to only include trailers and teasers from YouTube
        const filteredVideos = videosData.results.filter(
          video => (video.type === 'Trailer' || video.type === 'Teaser') && 
                  video.site === 'YouTube'
        );
        setVideos(filteredVideos);

        const filteredSeasons = tvData.seasons.filter((item) => (item.season_number != 0));
        setSeasons(filteredSeasons);
        
        // Set initial selected season to the first valid season
        if (filteredSeasons.length > 0) {
          setSelectedSeason(filteredSeasons[0].season_number);
        }
      } catch (err) {
        console.error('Failed to fetch TV series data:', err);
        setError('Failed to load TV series details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTvData();
  }, [tvId]);

  // Add a new useEffect to fetch episodes when selectedSeason changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!tvSeries || !selectedSeason) return;
      
      try {
        setLoadingEpisodes(true);
        const seasonData = await movieAPI.getTvSeasonDetails(tvId, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (err) {
        console.error(`Failed to fetch episodes for season ${selectedSeason}:`, err);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [tvId, selectedSeason, tvSeries]);

  // Add a new renderer for episodes
  const renderEpisodeItem = ({ item }) => (
    <View style={styles.episodeItem}>
      <View style={styles.episodeHeader}>
        <View style={styles.episodeNumberContainer}>
          <Text style={styles.episodeNumber}>{item.episode_number}</Text>
        </View>
        <View style={styles.episodeTitleContainer}>
          <Text style={styles.episodeTitle}>{item.name}</Text>
          {item.air_date && (
            <Text style={styles.episodeDate}>
              {new Date(item.air_date).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          )}
        </View>
        <View style={styles.episodeRatingContainer}>
          <Ionicons name="star" size={14} color={COLORS.primary} />
          <Text style={styles.episodeRating}>
            {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
          </Text>
        </View>
      </View>
      
      {item.still_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.still_path}` }}
          style={styles.episodeImage}
          resizeMode="cover"
        />
      )}
      
      {item.overview && (
        <Text style={styles.episodeOverview} numberOfLines={3}>
          {item.overview}
        </Text>
      )}
    </View>
  );

  // Prepare images for the image viewer
  const getImageViewerUrls = () => {
    return images.backdrops.map(img => ({
      url: `https://image.tmdb.org/t/p/original${img.file_path}`,
      width: img.width,
      height: img.height,
    }));
  };

  // Image gallery item renderer
  const renderGalleryItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.galleryItem}
      onPress={() => {
        setCurrentImageIndex(index);
        setModalVisible(true);
      }}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.file_path}` }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Video item renderer
  const renderVideoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.key}`)}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image
          source={{ uri: `https://img.youtube.com/vi/${item.key}/mqdefault.jpg` }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIconContainer}>
          <Ionicons name="play" size={24} color={COLORS.white} />
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.videoType}>{item.type}</Text>
    </TouchableOpacity>
  );

  // Season item renderer
  const renderSeasonItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.seasonItem, 
        selectedSeason === item.season_number && styles.selectedSeasonItem
      ]}
      onPress={() => setSelectedSeason(item.season_number)}
    >
      <Image
        source={
          item.poster_path 
            ? { uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }
            : { uri: tvSeries.getPosterUrl('w200') }
        }
        style={styles.seasonPoster}
        resizeMode="cover"
      />
      <Text style={styles.seasonName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.episodeCount}>
        {item.episode_count} episodes
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !tvSeries) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Backdrop Image with Gradient Overlay */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: tvSeries.getBackdropUrl() }}
            style={styles.backdropImage}
          />
          <LinearGradient
            colors={['transparent', COLORS.black]}
            style={styles.backdropGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          {/* TV Series Poster */}
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: tvSeries.getPosterUrl() }}
              style={styles.posterImage}
            />
          </View>
        </View>
        
        {/* TV Series Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{tvSeries.name}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{tvSeries.getRatingPercentage()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>{tvSeries.getFormattedFirstAirDate()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="tv-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>
                {tvSeries.numberOfSeasons} {tvSeries.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
              </Text>
            </View>
          </View>
          
          {/* Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{tvSeries.status}</Text>
          </View>
          
          {/* Genres */}
          {tvSeries.genres && (
            <View style={styles.genreContainer}>
              {tvSeries.genres.map(genre => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{tvSeries.overview}</Text>
          </View>
          
          {/* Created By */}
          {tvSeries.created_by && tvSeries.created_by.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Created By</Text>
              <Text style={styles.additionalInfo}>
                {tvSeries.created_by.map(creator => creator.name).join(', ')}
              </Text>
            </View>
          )}
          
          {/* Networks */}
          {tvSeries.networks && tvSeries.networks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Networks</Text>
              <View style={styles.networksContainer}>
                {tvSeries.networks.map(network => (
                  <View key={network.id} style={styles.networkItem}>
                    {network.logo_path ? (
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w200${network.logo_path}` }}
                        style={styles.networkLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.networkName}>{network.name}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.actionText}>Add to Watchlist</Text>
            </TouchableOpacity>
          </View>
          
          {/* Seasons */}
          {seasons.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seasons</Text>
              <FlatList
                data={seasons}
                keyExtractor={(item) => `season-${item.id}`}
                renderItem={renderSeasonItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonsList}
              />
            </View>
          )}
          
          {/* Episodes */}
          {selectedSeason && (
            <View style={styles.section}>
              <View style={styles.episodesSectionHeader}>
                <Text style={styles.sectionTitle}>Episodes</Text>
                <Text style={styles.selectedSeasonText}>
                  Season {selectedSeason}
                </Text>
              </View>
              
              {loadingEpisodes ? (
                <View style={styles.episodesLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : episodes.length > 0 ? (
                <FlatList
                  data={episodes}
                  keyExtractor={(item) => `episode-${item.id}`}
                  renderItem={renderEpisodeItem}
                  scrollEnabled={false}
                  contentContainerStyle={styles.episodesList}
                />
              ) : (
                <Text style={styles.noEpisodesText}>
                  No episodes available for this season.
                </Text>
              )}
            </View>
          )}
          
          {/* Videos Section */}
          {videos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos</Text>
              <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideoItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.videosList}
              />
            </View>
          )}
          
          {/* Gallery Section */}
          {images.backdrops && images.backdrops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                data={images.backdrops.slice(0, 10)} // Limit to 10 images
                keyExtractor={(item, index) => `backdrop-${index}`}
                renderItem={renderGalleryItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ImageViewer
            imageUrls={getImageViewerUrls()}
            index={currentImageIndex}
            enableSwipeDown={true}
            onSwipeDown={() => setModalVisible(false)}
            backgroundColor="rgba(0, 0, 0, 0.9)"
            renderHeader={() => (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  backdropContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  backArrow: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  posterContainer: {
    position: 'absolute',
    bottom: -60,
    left: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 10,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: 14,
  },
  statusContainer: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genreTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  genreText: {
    color: COLORS.white,
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overview: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  additionalInfo: {
    color: COLORS.white,
    fontSize: 14,
  },
  networksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  networkItem: {
    marginRight: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,1)',
    padding: 5,
  },
  networkLogo: {
    width: 80,
    height: 40,
    borderRadius: 5,
  },
  networkName: {
    color: COLORS.white,
    fontSize: 14,
  },
  seasonsList: {
    paddingVertical: 10,
  },
  seasonItem: {
    width: 120,
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 8,
  },
  selectedSeasonItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  seasonPoster: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 8,
  },
  seasonName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  episodeCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  galleryList: {
    paddingVertical: 10,
  },
  galleryItem: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  videosList: {
    paddingVertical: 10,
  },
  videoItem: {
    marginRight: 15,
    width: 220,
  },
  videoThumbnailContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  videoThumbnail: {
    width: 220,
    height: 124,
    borderRadius: 8,
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  videoTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  videoType: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  episodesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedSeasonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodesLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noEpisodesText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  episodesList: {
    paddingBottom: 10,
  },
  episodeItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  episodeHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  episodeNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeNumber: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  episodeTitleContainer: {
    flex: 1,
  },
  episodeTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  episodeDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  episodeRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  episodeRating: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 14,
  },
  episodeImage: {
    width: '100%',
    height: 180,
  },
  episodeOverview: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    paddingTop: 8,
  }
});

export default TvSeriesDetailScreen;