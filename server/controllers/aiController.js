const { GoogleGenAI } = require('@google/genai');
const {
  searchAnime,
  getAnimeInfo,
  getCharacterInfo,
  getAnimeRecommendations,
  findLibraryMatches
} = require('../services/anilistService');

const { analyzeQuestionPrompt, buildFinalSystemPrompt } = require('../prompts/aiPrompts');
const Anime = require('../models/Anime');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Analyze what the user is asking
const analyzeQuestion = async (message) => {
  const interaction = await ai.interactions.create({
    model: 'gemini-3.5-flash-lite',
    input: message,
    system_instruction: analyzeQuestionPrompt,
    generation_config: {
      temperature: 0,
      max_output_tokens: 180
    }
  });

  const result = interaction.output_text?.trim();
  console.log('QUESTION ANALYSIS:', result);

  if (!result) {
    throw new Error('Gemini did not analyze the question.');
  }

  try {
    return JSON.parse(result);
  } catch (error) {
    console.error('QUESTION ANALYSIS JSON ERROR:', result);
    throw new Error('Gemini returned invalid question analysis.');
  }
};

// Create the final Gemini response
const generateFinalResponse = async (
  message,
  intent,
  source,
  anilistData = null,
  libraryData = null
) => {
  const systemPrompt = buildFinalSystemPrompt({
    message,
    intent,
    source,
    anilistData,
    libraryData
  });

  const interaction = await ai.interactions.create({
    model: 'gemini-3.5-flash-lite',
    input: message,
    system_instruction: systemPrompt,
    generation_config: {
      temperature: 0.2,
      max_output_tokens: 500
    }
  });

  return interaction.output_text?.trim();
};

// Main AI controller
exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate the message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Please enter a question.'
      });
    }

    const userMessage = message.trim();

    // Get the user's anime library
    const animeList = await Anime.find({
      user: req.user.id
    }).select('title status genres favorite priority');

    // Analyze the question
    const analysis = await analyzeQuestion(userMessage);

    console.log('QUESTION ANALYSIS:', analysis);

    const intent = analysis.intent;
    const source = analysis.source;
    const sourceAnimeTitle = analysis.anime;
    const characterName = analysis.character;

    console.log('INTENT:', intent);
    console.log('SOURCE:', source);
    console.log('SOURCE ANIME:', sourceAnimeTitle);
    console.log('CHARACTER:', characterName);

    let anilistData = null;
    let libraryData = [];

    // Handle recommendation questions
    if (intent === 'recommendation') {
      // Risuto recommendations
      if (source === 'risuto') {
        console.log('Using Risuto library for recommendations.');

        libraryData = animeList
          .filter((anime) => anime.status === 'Plan to Watch')
          .map((anime) => ({
            title: anime.title,
            status: anime.status,
            genres: anime.genres,
            favorite: anime.favorite,
            priority: anime.priority
          }));
      }

      // AniList recommendations
      else if (source === 'anilist') {
        if (sourceAnimeTitle) {
          console.log('Getting AniList recommendations for:', sourceAnimeTitle);

          anilistData = await getAnimeRecommendations(sourceAnimeTitle);

          if (anilistData) {
            console.log(
              'ANILIST SOURCE:',
              anilistData.title?.english || anilistData.title?.romaji || anilistData.title?.native
            );
          }
        }
      }

      // AniList + Risuto
      else if (source === 'both') {
        if (sourceAnimeTitle) {
          console.log('Getting AniList recommendations for:', sourceAnimeTitle);

          anilistData = await getAnimeRecommendations(sourceAnimeTitle);

          if (anilistData) {
            console.log(
              'ANILIST SOURCE:',
              anilistData.title?.english || anilistData.title?.romaji || anilistData.title?.native
            );

            const matches = findLibraryMatches(animeList, anilistData);

            console.log(
              'ANILIST LIBRARY MATCHES:',
              matches.map((match) => match.libraryAnime.title)
            );

            libraryData = matches
              .filter((match) => match.libraryAnime.status === 'Plan to Watch')
              .map((match) => ({
                title: match.libraryAnime.title,
                status: match.libraryAnime.status,
                genres: match.libraryAnime.genres,
                favorite: match.libraryAnime.favorite,
                priority: match.libraryAnime.priority,
                anilist: match.anilistAnime
                  ? {
                      title: match.anilistAnime.title,
                      genres: match.anilistAnime.genres,
                      averageScore: match.anilistAnime.averageScore,
                      description: match.anilistAnime.description
                    }
                  : null,
                recommendationRating: match.recommendationRating
              }));
          }
        }
      }

      // Limit library candidates
      libraryData = libraryData.slice(0, 20);
    }

    // Handle anime information questions
    else if (intent === 'anime_information' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList anime information for:', sourceAnimeTitle);

      anilistData = await getAnimeInfo(sourceAnimeTitle);

      if (anilistData) {
        console.log(
          'ANILIST ANIME:',
          anilistData.title?.english || anilistData.title?.romaji || anilistData.title?.native
        );
      }
    }

    // Handle personal anime information
    else if (intent === 'anime_information' && source === 'risuto') {
      console.log('Using Risuto for anime information.');

      if (sourceAnimeTitle) {
        libraryData = animeList
          .filter((anime) => anime.title.toLowerCase().includes(sourceAnimeTitle.toLowerCase()))
          .map((anime) => ({
            title: anime.title,
            status: anime.status,
            genres: anime.genres,
            favorite: anime.favorite,
            priority: anime.priority
          }));
      } else {
        libraryData = animeList.map((anime) => ({
          title: anime.title,
          status: anime.status,
          genres: anime.genres,
          favorite: anime.favorite,
          priority: anime.priority
        }));
      }
    }

    // Handle character information
    else if (intent === 'character_information' && source === 'anilist' && characterName) {
      console.log('Getting AniList character information for:', characterName);

      anilistData = await getCharacterInfo(characterName);

      if (anilistData) {
        console.log('ANILIST CHARACTER:', anilistData.name?.full);
      }
    }

    // Handle anime relation questions
    else if (intent === 'anime_relations' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList relations for:', sourceAnimeTitle);

      const animeInfo = await getAnimeInfo(sourceAnimeTitle);

      if (animeInfo) {
        anilistData = {
          title: animeInfo.title,
          relations: animeInfo.relations
        };

        console.log('ANILIST RELATIONS FOUND:', animeInfo.relations?.edges?.length || 0);
      }
    }

    // Handle airing questions
    else if (intent === 'airing_information' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList airing information for:', sourceAnimeTitle);

      anilistData = await searchAnime(sourceAnimeTitle);

      if (anilistData) {
        anilistData = {
          title: anilistData.title,
          status: anilistData.status,
          episodes: anilistData.episodes,
          nextAiringEpisode: anilistData.nextAiringEpisode
        };

        console.log('NEXT AIRING EPISODE:', anilistData.nextAiringEpisode?.episode || 'None');
      }
    }

    // Generate the final response
    const response = await generateFinalResponse(
      userMessage,
      intent,
      source,
      anilistData,
      libraryData
    );

    console.log('GEMINI RESPONSE:', response);

    // Validate the response
    if (!response) {
      return res.status(500).json({
        message: 'AI could not generate a response.'
      });
    }

    // Send the response
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
