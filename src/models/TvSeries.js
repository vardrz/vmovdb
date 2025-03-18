class TvSeries {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.overview = data.overview;
    this.posterPath = data.poster_path;
    this.backdropPath = data.backdrop_path;
    this.firstAirDate = data.first_air_date;
    this.lastAirDate = data.last_air_date;
    this.voteAverage = data.vote_average;
    this.voteCount = data.vote_count;
    this.popularity = data.popularity;
    this.language = data.original_language;
    this.genreIds = data.genre_ids || [];
    this.genres = data.genres || [];
    this.numberOfSeasons = data.number_of_seasons;
    this.numberOfEpisodes = data.number_of_episodes;
    this.status = data.status;
    this.type = data.type;
    this.networks = data.networks || [];
    this.seasons = data.seasons || [];
    this.created_by = data.created_by || [];
    this.media_type = data.media_type || 'tv';
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

  // Format first air date
  getFormattedFirstAirDate() {
    if (!this.firstAirDate) return 'Unknown';
    const date = new Date(this.firstAirDate);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format last air date
  getFormattedLastAirDate() {
    if (!this.lastAirDate) return 'Present';
    const date = new Date(this.lastAirDate);
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

  // Get title (for compatibility with Movie model)
  get title() {
    return this.name;
  }

  // Get release date (for compatibility with Movie model)
  get releaseDate() {
    return this.firstAirDate;
  }

  // Get formatted release date (for compatibility with Movie model)
  getFormattedReleaseDate() {
    return this.getFormattedFirstAirDate();
  }

  // Get runtime (for compatibility with Movie model)
  get runtime() {
    return null; // TV series don't have a single runtime
  }
}

export default TvSeries;