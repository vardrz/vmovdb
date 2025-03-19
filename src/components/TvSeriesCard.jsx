import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const TvSeriesCard = ({ tvSeries, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(tvSeries)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: tvSeries.getPosterUrl() }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{tvSeries.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.primary} />
          <Text style={styles.rating}>{tvSeries.getRatingPercentage()}</Text>
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

export default TvSeriesCard;