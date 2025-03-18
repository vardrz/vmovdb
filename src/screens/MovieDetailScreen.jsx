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
import Movie from '../models/Movie';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const MovieDetailScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [images, setImages] = useState({ backdrops: [], posters: [] });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // Fetch movie details, images, and videos in parallel
        const [movieData, imagesData, videosData] = await Promise.all([
          movieAPI.getMovieDetails(movieId),
          movieAPI.getMovieImages(movieId),
          movieAPI.getMovieVideos(movieId)
        ]);
        
        setMovie(new Movie(movieData));
        setImages(imagesData);
        
        // Filter videos to only include trailers and teasers from YouTube
        const filteredVideos = videosData.results.filter(
          video => (video.type === 'Trailer' || video.type === 'Teaser') && 
                  video.site === 'YouTube'
        );
        setVideos(filteredVideos);
      } catch (err) {
        console.error('Failed to fetch movie data:', err);
        setError('Failed to load movie details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !movie) {
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
            source={{ uri: movie.getBackdropUrl() }}
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
          
          {/* Movie Poster */}
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: movie.getPosterUrl() }}
              style={styles.posterImage}
            />
          </View>
        </View>
        
        {/* Movie Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.metaText}>{movie.getRatingPercentage()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>{movie.getFormattedReleaseDate()}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.white} />
              <Text style={styles.metaText}>
                {movie.runtime ? `${movie.runtime} min` : 'N/A'}
              </Text>
            </View>
          </View>
          
          {/* Genres */}
          {movie.genres && (
            <View style={styles.genreContainer}>
              {movie.genres.map(genre => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>

          {/* Additional Info */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Production</Text>
              <Text style={styles.additionalInfo}>
                {movie.production_companies.map(company => company.name).join(', ')}
              </Text>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.actionText}>Add to Watchlist</Text>
            </TouchableOpacity>
          </View>
          
          {/* Gallery Section */}
          {images.backdrops && images.backdrops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
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
    marginTop: 20,
    marginBottom: 50
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
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  }
});

export default MovieDetailScreen;