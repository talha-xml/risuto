const { GoogleGenAI } = require('@google/genai');
const Anime = require('../models/Anime');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

exports.askAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Please enter a question.'
      });
    }

    // Get user's anime library
    const animeList = await Anime.find({
      user: req.user.id
    }).select('title status genres favorite priority');

    if (animeList.length === 0) {
      return res.status(400).json({
        message: 'Your anime library is empty.'
      });
    }

    const userMessage = message.trim().toLowerCase();

    let relevantAnime = [];

    // --------------------------------------------------
    // 1. Check if the user mentioned an anime
    // --------------------------------------------------

    const mentionedAnime = animeList.find((anime) =>
      userMessage.includes(anime.title.toLowerCase())
    );

    if (mentionedAnime) {
      // Find anime with similar genres
      const sourceGenres = mentionedAnime.genres || [];

      relevantAnime = animeList.filter((anime) => {
        // Don't recommend the anime itself
        if (anime._id.equals(mentionedAnime._id)) {
          return false;
        }

        // Only recommend Plan to Watch anime
        if (anime.status !== 'Plan to Watch') {
          return false;
        }

        const animeGenres = anime.genres || [];

        // Check for shared genres
        return animeGenres.some((genre) =>
          sourceGenres.some((sourceGenre) => genre.toLowerCase() === sourceGenre.toLowerCase())
        );
      });
    } else {
      // --------------------------------------------------
      // 2. No specific anime mentioned
      // --------------------------------------------------

      // Only send Plan to Watch anime
      relevantAnime = animeList.filter((anime) => anime.status === 'Plan to Watch');
    }

    // --------------------------------------------------
    // 3. Limit anime sent to Gemini
    // --------------------------------------------------

    relevantAnime = relevantAnime.slice(0, 30);

    const library = relevantAnime.map((anime) => ({
      title: anime.title,
      genres: anime.genres,
      favorite: anime.favorite,
      priority: anime.priority
    }));

    // --------------------------------------------------
    // 4. System instructions
    // --------------------------------------------------

    const systemPrompt = `
You are Risuto AI, an anime assistant.

You ONLY answer anime-related questions.

The anime provided below are from the user's personal library.

For recommendations:

- ONLY recommend anime from the provided list.
- Recommend a maximum of 5 anime.
- Prefer anime from "Plan to Watch".
- Choose anime that best match the user's requested anime, genre, theme, mood, or preference.
- Give a short reason for each recommendation.
- Keep each recommendation to one sentence.
- Keep the entire response under 80 words.
- Do not invent anime.
- Do not recommend anime outside the provided list.
- If there are no suitable anime in the provided list, clearly say so.
- Do not use headings such as "Recommended Anime".
- Do not use abbreviations.
- Always provide at least one recommendation when a suitable anime exists.
- Always make the suggested Anime in bold.

If the request is unrelated to anime, respond exactly:

"I can only help with anime-related questions."

Anime available for this request:

${JSON.stringify(library)}
`;

    // --------------------------------------------------
    // 5. Ask Gemini 3.5 Flash-Lite
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
    // 6. Get Gemini response
    // --------------------------------------------------

    const response = interaction.output_text?.trim();

    console.log('GEMINI RESPONSE:', response);

    if (!response) {
      return res.status(500).json({
        message: 'AI could not generate a response.'
      });
    }

    // --------------------------------------------------
    // 7. Send response to frontend
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
