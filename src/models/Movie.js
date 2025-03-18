// Movie model to standardize movie data structure
class Movie {
  constructor(data) {
    this.id = data.id;
    this.title = data.title ?? data.name;
    this.overview = data.overview;
    this.posterPath = data.poster_path;
    this.backdropPath = data.backdrop_path;
    this.releaseDate = data.release_date ?? data.first_air_date;
    this.voteAverage = data.vote_average;
    this.voteCount = data.vote_count;
    this.popularity = data.popularity;
    this.language = data.original_language;
    this.genreIds = data.genre_ids || [];
    this.genres = data.genres || [];
    this.runtime = data.runtime;
    this.production_companies = data.production_companies || [];
    this.media_type = data.media_type?? 'movie';
  }

  // Get full poster URL
  getPosterUrl(size = 'w500') {
    return this.posterPath 
      ? `https://image.tmdb.org/t/p/${size}${this.posterPath}` 
      : null;
  }

  // Get full backdrop URL
  getBackdropUrl(size = 'w1280') {
    return this.backdropPath 
      ? `https://image.tmdb.org/t/p/${size}${this.backdropPath}` 
      : null;
  }

  // Format release date
  getFormattedReleaseDate() {
    if (!this.releaseDate) return 'Unknown';
    const date = new Date(this.releaseDate);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get rating as a percentage
  getRatingPercentage() {
    return Number((this.voteAverage).toFixed(1));
  }
}

export default Movie;