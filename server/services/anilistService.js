const ANILIST_URL = 'https://graphql.anilist.co';

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

  return data.data.Media;
};

module.exports = {
  searchAnime
};
