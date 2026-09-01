const ANILIST_URL = 'https://graphql.anilist.co';

// --------------------------------------------------
// Normalize anime titles for matching
// --------------------------------------------------

const normalizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[\[\](){}]/g, ' ')
    .replace(/[-_:.,!?'"`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// --------------------------------------------------
// Search anime on AniList
// --------------------------------------------------

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

  const response = await fetch(ANILIST_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },

    body: JSON.stringify({
      query,
      variables: {
        search: animeName
      }
    })
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'AniList GraphQL error');
  }

  return data.data.Media;
};

// --------------------------------------------------
// Match AniList recommendations with Risuto library
// --------------------------------------------------

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
  findLibraryMatches
};
