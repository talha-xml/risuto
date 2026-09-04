const ANILIST_URL = 'https://graphql.anilist.co';

// Send a GraphQL request to AniList
const anilistRequest = async (query, variables = {}) => {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'AniList GraphQL error');
  }

  return data.data;
};

// Normalize anime titles for matching
const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[\[\]\(){}]/g, ' ')
    .replace(/[-\_:.,!?'"\`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Search anime and retrieve basic information
const searchAnime = async (animeName) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
          synonyms
        }

        description
        genres
        tags {
          name
          rank
        }

        format
        status
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        seasonYear
        episodes
        duration
        averageScore
        meanScore
        popularity
        favourites
        source
        countryOfOrigin

        coverImage {
          large
        }
        bannerImage
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: animeName
  });

  return data.Media;
};

// Get detailed information about an anime
const getAnimeInfo = async (animeName) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id

        title {
          romaji
          english
          native
          synonyms
        }

        description
        genres

        tags {
          name
          rank
          description
        }
        format
        status

        startDate {
          year
          month
          day
        }

        endDate {
          year
          month
          day
        }

        season
        seasonYear
        episodes
        duration
        averageScore
        meanScore
        popularity
        favourites
        source
        countryOfOrigin

        coverImage {
          large
        }

        bannerImage
        trailer {
          id
          site
          thumbnail
        }

        studios {
          nodes {
            id
            name
            isAnimationStudio
          }
        }

        relations {
          edges {
            relationType
            node {
              id
              type
              format
              title {
                romaji
                english
                native
              }
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: animeName
  });

  return data.Media;
};

// Search for a character on AniList
const getCharacterInfo = async (characterName) => {
  const query = `
    query ($search: String) {
      Character(search: $search) {
        id
        name {
          full
          native
          alternative
        }

        description
        gender
        age
        bloodType

        dateOfBirth {
          year
          month
          day
        }

        image {
          large
        }

        media {
          nodes {
            id

            title {
              romaji
              english
              native
            }

            type
            format
          }
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: characterName
  });

  return data.Character;
};

// Get anime recommendations from AniList
const getAnimeRecommendations = async (animeName) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        genres
        averageScore
        description
        recommendations(
          sort: RATING_DESC
          perPage: 20
        ) {
          nodes {
            rating
            mediaRecommendation {
              id
              title {
                romaji
                english
                native
              }
              genres
              averageScore
              description
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: animeName
  });

  return data.Media;
};

// Match AniList recommendations with Risuto library
const findLibraryMatches = (library, anilistAnime) => {
  if (!anilistAnime) {
    return [];
  }

  const recommendations = anilistAnime.recommendations?.nodes || [];
  const matches = [];

  for (const recommendation of recommendations) {
    const recommendedAnime = recommendation.mediaRecommendation;

    if (!recommendedAnime) {
      continue;
    }

    const titles = [
      recommendedAnime.title?.romaji,
      recommendedAnime.title?.english,
      recommendedAnime.title?.native
    ]
      .filter(Boolean)
      .map(normalizeTitle);

    const libraryAnime = library.find((anime) => {
      const libraryTitle = normalizeTitle(anime.title);

      return titles.some(
        (title) =>
          title === libraryTitle || title.includes(libraryTitle) || libraryTitle.includes(title)
      );
    });

    if (libraryAnime) {
      matches.push({
        libraryAnime,
        anilistAnime: recommendedAnime,
        recommendationRating: recommendation.rating
      });
    }
  }

  return matches;
};

module.exports = {
  searchAnime,
  getAnimeInfo,
  getCharacterInfo,
  getAnimeRecommendations,
  findLibraryMatches
};
