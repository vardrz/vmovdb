import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const MovieCard = ({ movie, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(movie)}>
      <Image 
        source={{ uri: movie.getPosterUrl() }} 
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>{movie.getRatingPercentage()}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
        <Text style={styles.releaseDate}>{movie.getFormattedReleaseDate()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 15,
    backgroundColor: COLORS.black,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  poster: {
    width: '100%',
    height: 225,
    borderRadius: 8,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  releaseDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  }
});

export default MovieCard;