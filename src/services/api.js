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

export const movieAPI = {
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
    },
  
    getMovieVideos: async (movieId) => {
        try {
            const url = `${BASE_URL}/movie/${movieId}/videos`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch videos for movie ID ${movieId}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching movie videos for ID ${movieId}:`, error);
            throw error;
        }
    },
  
    getMovieImages: async (movieId) => {
        try {
            const url = `${BASE_URL}/movie/${movieId}/images`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch images for movie ID ${movieId}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching movie images for ID ${movieId}:`, error);
            throw error;
        }
    },

    searchMovies: async (query, page = 1) => {
        try {
            const url = buildUrl('/search/multi', {
                query: query,
                include_adult: false,
                language: 'id-ID',
                page: page
            });
            
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || 'Failed to search movies');
            }
            
            // Filter results to only include movies and TV shows
            if (data.results) {
                data.results = data.results.filter(item => 
                    item.media_type === 'movie' || item.media_type === 'tv'
                );
            }
            
            return data;
        } catch (error) {
            console.error('Error searching movies and TV shows:', error);
            throw error;
        }
    },

    // TV Series Detail
    getTvDetails: async (tvId) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch TV series details for ID ${tvId}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching TV series details for ID ${tvId}:`, error);
            throw error;
        }
    },
    
    // Get TV series videos
    getTvVideos: async (tvId) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/videos`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch videos for TV series ID ${tvId}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching TV series videos for ID ${tvId}:`, error);
            throw error;
        }
    },
    
    // Get TV series images
    getTvImages: async (tvId) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/images`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch images for TV series ID ${tvId}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching TV series images for ID ${tvId}:`, error);
            throw error;
        }
    },
    
    getTvSeasonDetails: async (tvId, seasonNumber) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch season details for TV series ID ${tvId}, season ${seasonNumber}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching season details for TV series ID ${tvId}, season ${seasonNumber}:`, error);
            throw error;
        }
    },
    
    // Get TV episode details
    getTvEpisodeDetails: async (tvId, seasonNumber, episodeNumber) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch episode details for TV series ID ${tvId}, season ${seasonNumber}, episode ${episodeNumber}`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching episode details for TV series ID ${tvId}, season ${seasonNumber}, episode ${episodeNumber}:`, error);
            throw error;
        }
    },
    
    // Get TV episode images
    getTvEpisodeImages: async (tvId, seasonNumber, episodeNumber) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/images`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch episode images`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching episode images:`, error);
            throw error;
        }
    },
    
    // Get TV episode videos
    getTvEpisodeVideos: async (tvId, seasonNumber, episodeNumber) => {
        try {
            const url = `${BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/videos`;
            const response = await fetch(url, { headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.status_message || `Failed to fetch episode videos`);
            }
            
            return data;
        } catch (error) {
            console.error(`Error fetching episode videos:`, error);
            throw error;
        }
    },
};

export default movieAPI;