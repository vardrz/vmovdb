import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const MovieCard = ({ movie, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <Image
        source={{ 
          uri: movie.getPosterUrl(),
          cache: 'force-cache' // Force caching of images
        }}
        defaultSource={require('../../assets/images/no-image.jpg')}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.primary} />
          <Text style={styles.rating}>{movie.getRatingPercentage()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 15,
  },
  poster: {
    width: '100%',
    height: 210,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.cardBackground, // Add background color while loading
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: COLORS.white,
    marginLeft: 4,
    fontSize: 12,
  }
});

export default React.memo(MovieCard); // Use memo to prevent unnecessary re-renders