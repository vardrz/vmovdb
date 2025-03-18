// Replace axios with fetch for better compatibility with React Native
// import axios from 'axios';
import { EXPO_PUBLIC_TMDB_ACCESS_TOKEN } from '@env';

// Base URL for TMDB API
const BASE_URL = 'https://api.themoviedb.org/3';

// Common headers for all requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${EXPO_PUBLIC_TMDB_ACCESS_TOKEN}`,
  'accept': 'application/json'
};

// Helper function to build URL with query parameters
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  return url.toString();
};

// Movie related API calls
export const movieAPI = {
  // Get top rated movies
  getTopRatedMovies: async (page = 1) => {
    try {
      const url = buildUrl('/movie/top_rated', {
        include_adult: false,
        include_video: false,
        language: 'en-US',
        page: page,
        sort_by: 'vote_average.desc',
        without_genres: '99,10755',
        'vote_count.gte': 200
      });
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || 'Failed to fetch movies');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    try {
      const url = `${BASE_URL}/movie/${movieId}`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.status_message || `Failed to fetch movie details for ID ${movieId}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      throw error;
    }
  }
};

export default movieAPI;