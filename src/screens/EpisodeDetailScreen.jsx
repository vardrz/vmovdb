import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Modal,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import { movieAPI } from '../services/api';
import TvEpisode from '../models/TvEpisode';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const EpisodeDetailScreen = ({ route, navigation }) => {
  const { tvId, seasonNumber, episodeNumber, seriesName, seasonName } = route.params;
  const [episode, setEpisode] = useState(null);
  const [images, setImages] = useState({ stills: [] });
  const [videos, setVideos] = useState({ results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        // Fetch episode details, images, and videos in parallel
        const [episodeData, imagesData, videosData] = await Promise.all([
          movieAPI.getTvEpisodeDetails(tvId, seasonNumber, episodeNumber),
          movieAPI.getTvEpisodeImages(tvId, seasonNumber, episodeNumber),
          movieAPI.getTvEpisodeVideos(tvId, seasonNumber, episodeNumber)
        ]);
        
        setEpisode(new TvEpisode(episodeData));
        setImages(imagesData);
        setVideos(videosData);
      } catch (err) {
        console.error('Failed to fetch episode data:', err);
        setError('Failed to load episode details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [tvId, seasonNumber, episodeNumber]);

  // Prepare images for the image viewer
  const getImageViewerUrls = () => {
    return images.stills.map(img => ({
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

  // Cast item renderer
  const renderCastItem = ({ item }) => (
    <View style={styles.castItem}>
      <Image
        source={
          item.profile_path 
            ? { uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }
            : require('../../assets/images/no-image.jpg')
        }
        style={styles.castImage}
        resizeMode="cover"
      />
      <Text style={styles.castName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.castCharacter} numberOfLines={2}>{item.character}</Text>
    </View>
  );

  // Crew item renderer
  const renderCrewItem = ({ item }) => (
    <View style={styles.crewItem}>
      <Text style={styles.crewName}>{item.name}</Text>
      <Text style={styles.crewJob}>{item.job}</Text>
    </View>
  );

  // Video item renderer
  const renderVideoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => {
        const youtubeUrl = `https://www.youtube.com/watch?v=${item.key}`;
        Linking.openURL(youtubeUrl);
      }}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image
          source={{ uri: `https://img.youtube.com/vi/${item.key}/hqdefault.jpg` }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
        </View>
      </View>
      <Text style={styles.videoName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.videoType}>{item.type}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !episode) {
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
        {/* Episode Still Image with Gradient Overlay */}
        <View style={styles.stillContainer}>
          <Image
            source={
              episode.getStillUrl() 
                ? { uri: episode.getStillUrl() }
                : require('../../assets/images/no-image.jpg')
            }
            style={styles.stillImage}
          />
          <LinearGradient
            colors={['transparent', COLORS.black]}
            style={styles.stillGradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        {/* Episode Info */}
        <View style={styles.infoContainer}>
          {/* Series and Season Info */}
          <TouchableOpacity 
            style={styles.seriesInfo}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="tv-outline" size={16} color={COLORS.primary} />
            <Text style={styles.seriesText}>
              {seriesName} • {seasonName}
            </Text>
          </TouchableOpacity>
          
          {/* Episode Title */}
          <Text style={styles.title}>
            {episode.episode_number}. {episode.name}
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{episode.getRatingPercentage()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>{episode.getFormattedAirDate()}</Text>
            </View>
            {episode.runtime && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={COLORS.white} />
                <Text style={styles.metaText}>{episode.getFormattedRuntime()}</Text>
              </View>
            )}
          </View>
          
          {/* Overview */}
          {episode.overview && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{episode.overview}</Text>
            </View>
          )}
          
          {/* Crew - Directors */}
          {episode.getDirectors().length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Director{episode.getDirectors().length > 1 ? 's' : ''}</Text>
              <FlatList
                data={episode.getDirectors()}
                keyExtractor={(item) => `director-${item.id}`}
                renderItem={renderCrewItem}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Crew - Writers */}
          {episode.getWriters().length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Writer{episode.getWriters().length > 1 ? 's' : ''}</Text>
              <FlatList
                data={episode.getWriters()}
                keyExtractor={(item) => `writer-${item.id}`}
                renderItem={renderCrewItem}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {/* Cast */}
          {episode.guest_stars && episode.guest_stars.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <FlatList
                data={episode.guest_stars}
                keyExtractor={(item) => `cast-${item.id}`}
                renderItem={renderCastItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              />
            </View>
          )}
          
          {/* Images Gallery */}
          {images.stills && images.stills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <FlatList
                data={images.stills}
                keyExtractor={(item, index) => `still-${index}`}
                renderItem={renderGalleryItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              />
            </View>
          )}
          
          {/* Videos Section */}
          {videos.results && videos.results.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos</Text>
              <FlatList
                data={videos.results}
                keyExtractor={(item) => `video-${item.id}`}
                renderItem={renderVideoItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.videosList}
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
  stillContainer: {
    height: height * 0.3,
    position: 'relative',
  },
  stillImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stillGradient: {
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
  infoContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  seriesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  seriesText: {
    color: COLORS.primary,
    fontSize: 14,
    marginLeft: 5,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
  crewItem: {
    marginBottom: 8,
  },
  crewName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  crewJob: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  castList: {
    paddingVertical: 10,
  },
  castItem: {
    width: 120,
    marginRight: 15,
  },
  castImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  castName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  castCharacter: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  videosList: {
    paddingVertical: 10,
  },
  videoItem: {
    width: 220,
    marginRight: 15,
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
  videoName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  videoType: {
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
  }
});

export default EpisodeDetailScreen;