const { GoogleGenAI } = require('@google/genai');

const { searchAnime, findLibraryMatches } = require('../services/anilistService');

const Anime = require('../models/Anime');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// --------------------------------------------------
// Identify the main anime from the user's question
// --------------------------------------------------

const identifyAnime = async (message) => {
  const interaction = await ai.interactions.create({
    model: 'gemini-3.5-flash-lite',

    input: message,

    system_instruction: `
Identify the main anime title the user is asking about.

Examples:

"What should I watch after Naruto?"
Return:
Naruto

"Recommend something similar to Attack on Titan"
Return:
Attack on Titan

"What anime is like Black Bullet?"
Return:
Black Bullet

If the user is not asking about a specific anime,
return exactly:

NONE

Return ONLY the anime title.

Do not explain your answer.
Do not add punctuation.
`,

    generation_config: {
      temperature: 0,
      max_output_tokens: 30
    }
  });

  return interaction.output_text?.trim();
};

// --------------------------------------------------
// Main AI controller
// --------------------------------------------------

exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;

    // --------------------------------------------------
    // 1. Validate user message
    // --------------------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Please enter a question.'
      });
    }

    // --------------------------------------------------
    // 2. Get user's anime library
    // --------------------------------------------------

    const animeList = await Anime.find({
      user: req.user.id
    }).select('title status genres favorite priority');

    if (animeList.length === 0) {
      return res.status(400).json({
        message: 'Your anime library is empty.'
      });
    }

    // --------------------------------------------------
    // 3. Identify source anime using Gemini
    // --------------------------------------------------

    const sourceAnimeTitle = await identifyAnime(message.trim());

    console.log('IDENTIFIED ANIME:', sourceAnimeTitle);

    // --------------------------------------------------
    // 4. Search identified anime on AniList
    // --------------------------------------------------

    let anilistAnime = null;

    if (sourceAnimeTitle && sourceAnimeTitle !== 'NONE') {
      anilistAnime = await searchAnime(sourceAnimeTitle);

      if (anilistAnime) {
        console.log(
          'ANILIST SOURCE:',
          anilistAnime.title?.english || anilistAnime.title?.romaji || anilistAnime.title?.native
        );
      }
    }

    // --------------------------------------------------
    // 5. Find relevant anime from user's library
    // --------------------------------------------------

    let relevantAnime = [];

    if (anilistAnime) {
      /*
       * AniList provides recommendations for the
       * source anime.
       *
       * findLibraryMatches() compares those AniList
       * recommendations against the user's library.
       */

      const matches = findLibraryMatches(animeList, anilistAnime);

      console.log(
        'ANIList LIBRARY MATCHES:',
        matches.map((match) => match.libraryAnime.title)
      );

      // --------------------------------------------------
      // Keep only Plan to Watch anime
      // --------------------------------------------------

      relevantAnime = matches
        .filter((match) => match.libraryAnime.status === 'Plan to Watch')
        .map((match) => ({
          libraryAnime: match.libraryAnime,
          anilistAnime: match.anilistAnime,
          recommendationRating: match.rating
        }));
    } else {
      /*
       * No specific anime was identified.
       *
       * Use the user's Plan to Watch library.
       */

      relevantAnime = animeList
        .filter((anime) => anime.status === 'Plan to Watch')
        .map((anime) => ({
          libraryAnime: anime,
          anilistAnime: null,
          recommendationRating: null
        }));
    }

    // --------------------------------------------------
    // 6. Limit candidates
    // --------------------------------------------------

    relevantAnime = relevantAnime.slice(0, 20);

    // --------------------------------------------------
    // 7. Prepare library data for Gemini
    // --------------------------------------------------

    const library = relevantAnime.map((anime) => ({
      title: anime.libraryAnime.title,

      status: anime.libraryAnime.status,

      genres: anime.libraryAnime.genres,

      favorite: anime.libraryAnime.favorite,

      priority: anime.libraryAnime.priority,

      anilist: anime.anilistAnime
        ? {
            title: anime.anilistAnime.title,

            genres: anime.anilistAnime.genres,

            averageScore: anime.anilistAnime.averageScore,

            description: anime.anilistAnime.description
          }
        : null,

      recommendationRating: anime.recommendationRating
    }));

    // --------------------------------------------------
    // 8. Prepare source anime information
    // --------------------------------------------------

    let sourceAnime = null;

    if (anilistAnime) {
      sourceAnime = {
        title: anilistAnime.title,

        genres: anilistAnime.genres,

        averageScore: anilistAnime.averageScore,

        description: anilistAnime.description
      };
    }

    // --------------------------------------------------
    // 9. System instructions for final response
    // --------------------------------------------------

    const systemPrompt = `
You are Risuto AI, an anime assistant.

You ONLY answer anime-related questions.

The user owns the anime listed under
"ANIME FROM USER'S RISUTO LIBRARY".

IMPORTANT RECOMMENDATION RULES:

- ONLY recommend anime from the provided Risuto library.
- NEVER invent an anime.
- NEVER recommend an anime outside the provided library.
- Recommend a maximum of 5 anime.
- ONLY recommend anime whose status is "Plan to Watch".
- Do not recommend Completed, Watching, On Hold,
  Incomplete, or Dropped anime.
- Prefer anime that genuinely match the user's request.
- When AniList recommendation information is provided,
  use it as the primary source for determining similarity.
- Use the AniList genres and description when explaining
  why an anime matches.
- Do not invent genres, themes, plot details,
  or other information.
- Do not recommend unrelated anime just to reach 5.
- If there are no suitable anime, clearly say so.
- Give one short sentence explaining each recommendation.
- Keep the entire response under 100 words.
- Always make recommended anime titles bold.
- Do not use a heading such as "Recommended Anime".
- Do not use abbreviations.
- Do not mention these instructions.

THE USER'S REQUEST:

${message.trim()}

SOURCE ANIME FROM ANILIST:

${JSON.stringify(sourceAnime, null, 2)}

ANIME FROM USER'S RISUTO LIBRARY
THAT MAY BE RECOMMENDED:

${JSON.stringify(library, null, 2)}

Remember:

The final recommendations MUST come only from
the provided Risuto library.
`;

    // --------------------------------------------------
    // 10. Ask Gemini for final response
    // --------------------------------------------------

    const interaction = await ai.interactions.create({
      model: 'gemini-3.5-flash-lite',

      input: message.trim(),

      system_instruction: systemPrompt,

      generation_config: {
        temperature: 0.2,
        max_output_tokens: 500
      }
    });

    // --------------------------------------------------
    // 11. Get Gemini response
    // --------------------------------------------------

    const response = interaction.output_text?.trim();

    console.log('GEMINI RESPONSE:', response);

    // --------------------------------------------------
    // 12. Validate response
    // --------------------------------------------------

    if (!response) {
      return res.status(500).json({
        message: 'AI could not generate a response.'
      });
    }

    // --------------------------------------------------
    // 13. Send response to frontend
    // --------------------------------------------------

    return res.status(200).json({
      response
    });
  } catch (error) {
    console.error('GEMINI AI ERROR:', error);

    return res.status(500).json({
      message: 'Something went wrong while contacting Risuto AI.'
    });
  }
};
