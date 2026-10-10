const ANILIST_URL = 'https://graphql.anilist.co';

// Send a GraphQL request to AniList with error handling and timeout
const anilistRequest = async (query, variables = {}) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    // If AniList returns 404 (Entity not found), return null gracefully
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.warn(`AniList responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      const isNotFound = data.errors.some(
        (err) => err.status === 404 || err.message?.toLowerCase().includes('not found')
      );
      if (isNotFound) {
        return null;
      }
      console.warn('AniList GraphQL warning:', data.errors[0]?.message);
      return data.data || null;
    }

    return data.data || null;
  } catch (error) {
    console.warn('AniList request error:', error.message);
    return null;
  }
};

// Normalize anime titles for matching
const normalizeTitle = (title) => {
  return (title || '')
    .toLowerCase()
    .replace(/[\[\]\(){}]/g, ' ')
    .replace(/[-\_:.,!?'"\`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Search anime and retrieve basic information (token-efficient)
const searchAnime = async (animeName) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        format
        status
        episodes
        seasonYear
        averageScore
        nextAiringEpisode {
          episode
          airingAt
          timeUntilAiring
        }
        genres
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: animeName
  });

  return data?.Media || null;
};

// Get detailed information about an anime (token-efficient: plain text description, no heavy images/tags)
const getAnimeInfo = async (animeName) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description(asHtml: false)
        genres
        format
        status
        episodes
        seasonYear
        averageScore
        studios(isMain: true) {
          nodes {
            name
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

  return data?.Media || null;
};

// Search for a character on AniList (token-efficient)
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
        media(type: ANIME, sort: POPULARITY_DESC, perPage: 5) {
          nodes {
            title {
              romaji
              english
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: characterName
  });

  return data?.Character || null;
};

// Get anime recommendations from AniList (token-efficient: compact recommendations without raw descriptions)
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
        recommendations(
          sort: RATING_DESC
          perPage: 8
        ) {
          nodes {
            rating
            mediaRecommendation {
              id
              type
              format
              title {
                romaji
                english
                native
              }
              genres
              averageScore
            }
          }
        }
      }
    }
  `;

  const data = await anilistRequest(query, {
    search: animeName
  });

  return data?.Media || null;
};

// Match AniList recommendations with Risuto library
const findLibraryMatches = (library = [], anilistAnime) => {
  if (!anilistAnime) {
    return [];
  }

  const recommendations = anilistAnime.recommendations?.nodes || [];
  const matches = [];

  for (const recommendation of recommendations) {
    const recommendedAnime = recommendation.mediaRecommendation;

    if (!recommendedAnime || (recommendedAnime.type && recommendedAnime.type !== 'ANIME')) {
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

      return titles.some((title) => {
        if (!title || !libraryTitle) return false;
        if (title === libraryTitle) return true;
        if (libraryTitle.length >= 4 && title.includes(libraryTitle)) return true;
        if (title.length >= 4 && libraryTitle.includes(title)) return true;
        return false;
      });
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
