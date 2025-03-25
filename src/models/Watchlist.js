import AsyncStorage from '@react-native-async-storage/async-storage';

class Watchlist {
  static STORAGE_KEY = 'user_watchlist';
  
  static async getAll() {
    try {
      const jsonValue = await AsyncStorage.getItem(Watchlist.STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : { movies: [], tvSeries: [], episodes: [] };
    } catch (e) {
      console.error('Error reading watchlist from storage:', e);
      return { movies: [], tvSeries: [], episodes: [] };
    }
  }
  
  static async saveAll(watchlist) {
    try {
      const jsonValue = JSON.stringify(watchlist);
      await AsyncStorage.setItem(Watchlist.STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Error saving watchlist to storage:', e);
    }
  }
  
  static async addMovie(movie) {
    try {
      const watchlist = await this.getAll();
      // Check if movie already exists in watchlist
      if (!watchlist.movies.some(m => m.id === movie.id)) {
        // Store only necessary data
        const movieData = {
          id: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
          addedAt: new Date().toISOString()
        };

        watchlist.movies.push(movieData);
        await this.saveAll(watchlist);
      }
      return true;
    } catch (e) {
      console.error('Error adding movie to watchlist:', e);
      return false;
    }
  }
  
  static async addTvSeries(tvSeries) {
    try {
      const watchlist = await this.getAll();
      // Check if TV series already exists in watchlist
      if (!watchlist.tvSeries.some(t => t.id === tvSeries.id)) {
        // Store only necessary data
        const tvData = {
          id: tvSeries.id,
          name: tvSeries.name,
          posterPath: tvSeries.posterPath,
          firstAirDate: tvSeries.firstAirDate,
          voteAverage: tvSeries.voteAverage,
          addedAt: new Date().toISOString()
        };
        watchlist.tvSeries.push(tvData);
        await this.saveAll(watchlist);
      }
      return true;
    } catch (e) {
      console.error('Error adding TV series to watchlist:', e);
      return false;
    }
  }
  
  static async removeMovie(movieId) {
    try {
      const watchlist = await this.getAll();
      watchlist.movies = watchlist.movies.filter(movie => movie.id !== movieId);
      await this.saveAll(watchlist);
      return true;
    } catch (e) {
      console.error('Error removing movie from watchlist:', e);
      return false;
    }
  }
  
  static async removeTvSeries(tvId) {
    try {
      const watchlist = await this.getAll();
      watchlist.tvSeries = watchlist.tvSeries.filter(tv => tv.id !== tvId);
      await this.saveAll(watchlist);
      return true;
    } catch (e) {
      console.error('Error removing TV series from watchlist:', e);
      return false;
    }
  }
  
  static async isMovieInWatchlist(movieId) {
    try {
      const watchlist = await this.getAll();
      return watchlist.movies.some(movie => movie.id === movieId);
    } catch (e) {
      console.error('Error checking if movie is in watchlist:', e);
      return false;
    }
  }
  
  static async isTvSeriesInWatchlist(tvId) {
    try {
      const watchlist = await this.getAll();
      return watchlist.tvSeries.some(tv => tv.id === tvId);
    } catch (e) {
      console.error('Error checking if TV series is in watchlist:', e);
      return false;
    }
  }
  
  static async addEpisode(episode, tvId, seriesName, seasonName) {
    try {
      const watchlist = await this.getAll();
      // Initialize episodes array if it doesn't exist
      if (!watchlist.episodes) {
        watchlist.episodes = [];
      }
      
      // Check if episode already exists in watchlist
      if (!watchlist.episodes.some(e => 
        e.tvId === tvId && 
        e.seasonNumber === episode.season_number && 
        e.episodeNumber === episode.episode_number
      )) {
        // Store only necessary data
        const episodeData = {
          id: episode.id,
          tvId: tvId,
          seriesName: seriesName,
          seasonName: seasonName,
          seasonNumber: episode.season_number,
          episodeNumber: episode.episode_number,
          name: episode.name,
          stillPath: episode.still_path,
          airDate: episode.air_date,
          voteAverage: episode.vote_average,
          addedAt: new Date().toISOString()
        };
        watchlist.episodes.push(episodeData);
        await this.saveAll(watchlist);
      }
      return true;
    } catch (e) {
      console.error('Error adding episode to watchlist:', e);
      return false;
    }
  }
  
  static async removeEpisode(tvId, seasonNumber, episodeNumber) {
    try {
      const watchlist = await this.getAll();
      if (!watchlist.episodes) {
        return true; // Nothing to remove
      }
      
      watchlist.episodes = watchlist.episodes.filter(
        episode => !(episode.tvId === tvId && 
                    episode.seasonNumber === seasonNumber && 
                    episode.episodeNumber === episodeNumber)
      );
      await this.saveAll(watchlist);
      return true;
    } catch (e) {
      console.error('Error removing episode from watchlist:', e);
      return false;
    }
  }
  
  static async isEpisodeInWatchlist(tvId, seasonNumber, episodeNumber) {
    try {
      const watchlist = await this.getAll();
      if (!watchlist.episodes) {
        return false;
      }
      
      return watchlist.episodes.some(
        episode => episode.tvId === tvId && 
                  episode.seasonNumber === seasonNumber && 
                  episode.episodeNumber === episodeNumber
      );
    } catch (e) {
      console.error('Error checking if episode is in watchlist:', e);
      return false;
    }
  }
}

export default Watchlist;