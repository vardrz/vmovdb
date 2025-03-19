class TvEpisode {
    constructor(episodeData) {
        this.id = episodeData.id;
        this.name = episodeData.name;
        this.overview = episodeData.overview;
        this.episode_number = episodeData.episode_number;
        this.season_number = episodeData.season_number;
        this.air_date = episodeData.air_date;
        this.still_path = episodeData.still_path;
        this.vote_average = episodeData.vote_average;
        this.vote_count = episodeData.vote_count;
        this.crew = episodeData.crew || [];
        this.guest_stars = episodeData.guest_stars || [];
        this.runtime = episodeData.runtime;
        this.production_code = episodeData.production_code;
    }

    getStillUrl(size = 'original') {
        if (!this.still_path) return null;
        return `https://image.tmdb.org/t/p/${size}${this.still_path}`;
    }

    getFormattedAirDate() {
        if (!this.air_date) return 'Unknown';
        return new Date(this.air_date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getRatingPercentage() {
        if (!this.vote_average) return 'N/A';
        return Number((this.vote_average).toFixed(1));
    }

    getDirectors() {
        return this.crew.filter(person => person.job === 'Director');
    }

    getWriters() {
        return this.crew.filter(person => 
            person.job === 'Writer' || 
            person.job === 'Screenplay' || 
            person.job === 'Story'
        );
    }

    getFormattedRuntime() {
        if (!this.runtime) return 'Unknown';
        const hours = Math.floor(this.runtime / 60);
        const minutes = this.runtime % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
}

export default TvEpisode;