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

// Helper to clean descriptions and minimize tokens
const cleanText = (text, maxLength = 220) => {
  if (!text) return '';
  const cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/~!.*?~!/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
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
      max_output_tokens: 350
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

    let anilistData = null;
    let libraryData = [];

    // Handle recommendation questions
    if (intent === 'recommendation') {
      if (source === 'risuto') {
        console.log('Using Risuto library for recommendations.');

        libraryData = animeList
          .filter((anime) => anime.status === 'Plan to Watch')
          .slice(0, 15)
          .map((anime) => ({
            title: anime.title,
            status: anime.status,
            genres: anime.genres,
            favorite: anime.favorite,
            priority: anime.priority
          }));
      } else if (source === 'anilist') {
        if (sourceAnimeTitle) {
          console.log('Getting AniList recommendations for:', sourceAnimeTitle);

          const raw = await getAnimeRecommendations(sourceAnimeTitle);
          if (raw) {
            anilistData = {
              title: raw.title?.english || raw.title?.romaji,
              recommendations: raw.recommendations?.nodes
                ?.filter((n) => !n.mediaRecommendation?.type || n.mediaRecommendation.type === 'ANIME')
                ?.slice(0, 5)
                ?.map((n) => ({
                  title: n.mediaRecommendation?.title?.english || n.mediaRecommendation?.title?.romaji,
                  genres: n.mediaRecommendation?.genres,
                  score: n.mediaRecommendation?.averageScore
                }))
            };
          } else {
            anilistData = { notFound: true, searchedTitle: sourceAnimeTitle };
          }
        }
      } else if (source === 'both') {
        if (sourceAnimeTitle) {
          console.log('Getting AniList recommendations for:', sourceAnimeTitle);

          const raw = await getAnimeRecommendations(sourceAnimeTitle);
          if (raw) {
            const matches = findLibraryMatches(animeList, raw);
            libraryData = matches
              .filter((match) => match.libraryAnime.status === 'Plan to Watch')
              .slice(0, 10)
              .map((match) => ({
                title: match.libraryAnime.title,
                status: match.libraryAnime.status,
                genres: match.libraryAnime.genres,
                matchedWith: match.anilistAnime?.title?.english || match.anilistAnime?.title?.romaji
              }));

            anilistData = {
              title: raw.title?.english || raw.title?.romaji,
              recommendations: raw.recommendations?.nodes?.slice(0, 5)?.map((n) => ({
                title: n.mediaRecommendation?.title?.english || n.mediaRecommendation?.title?.romaji,
                genres: n.mediaRecommendation?.genres
              }))
            };
          } else {
            anilistData = { notFound: true, searchedTitle: sourceAnimeTitle };
          }
        }
      }
    }

    // Handle anime information questions
    else if (intent === 'anime_information' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList anime information for:', sourceAnimeTitle);

      const raw = await getAnimeInfo(sourceAnimeTitle);
      if (raw) {
        anilistData = {
          title: raw.title?.english || raw.title?.romaji || raw.title?.native,
          genres: raw.genres,
          format: raw.format,
          status: raw.status,
          episodes: raw.episodes,
          seasonYear: raw.seasonYear,
          score: raw.averageScore,
          summary: cleanText(raw.description, 220),
          studios: raw.studios?.nodes?.map((s) => s.name).slice(0, 2),
          relations: raw.relations?.edges?.slice(0, 5)?.map((e) => ({
            relation: e.relationType,
            title: e.node?.title?.english || e.node?.title?.romaji
          }))
        };
      } else {
        anilistData = { notFound: true, searchedTitle: sourceAnimeTitle };
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
        libraryData = animeList.slice(0, 15).map((anime) => ({
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

      const raw = await getCharacterInfo(characterName);
      if (raw) {
        anilistData = {
          name: raw.name?.full || raw.name?.native,
          gender: raw.gender,
          age: raw.age,
          bio: cleanText(raw.description, 250),
          appearsIn: raw.media?.nodes?.slice(0, 4)?.map((m) => m.title?.english || m.title?.romaji)
        };
      } else {
        anilistData = { notFound: true, searchedCharacter: characterName };
      }
    }

    // Handle anime relation questions
    else if (intent === 'anime_relations' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList relations for:', sourceAnimeTitle);

      const raw = await getAnimeInfo(sourceAnimeTitle);
      if (raw) {
        anilistData = {
          title: raw.title?.english || raw.title?.romaji,
          relations: raw.relations?.edges?.slice(0, 6)?.map((e) => ({
            relation: e.relationType,
            title: e.node?.title?.english || e.node?.title?.romaji,
            format: e.node?.format
          }))
        };
      } else {
        anilistData = { notFound: true, searchedTitle: sourceAnimeTitle };
      }
    }

    // Handle airing questions
    else if (intent === 'airing_information' && source === 'anilist' && sourceAnimeTitle) {
      console.log('Getting AniList airing information for:', sourceAnimeTitle);

      const raw = await searchAnime(sourceAnimeTitle);
      if (raw) {
        anilistData = {
          title: raw.title?.english || raw.title?.romaji,
          status: raw.status,
          episodes: raw.episodes,
          nextAiringEpisode: raw.nextAiringEpisode
        };
      } else {
        anilistData = { notFound: true, searchedTitle: sourceAnimeTitle };
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
      return res.status(200).json({
        response: "I couldn't find any information on that. Perhaps you meant someone else or typed the spelling incorrectly?"
      });
    }

    // Send the response
    return res.status(200).json({
      response
    });
  } catch (error) {
    console.error('RISUTO AI ERROR:', error);

    return res.status(200).json({
      response: "I couldn't find the information you were looking for. Perhaps you meant someone else or incorrectly typed the spelling?"
    });
  }
};
