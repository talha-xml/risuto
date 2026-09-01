const Groq = require('groq-sdk');
const Anime = require('../models/Anime');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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

    // --------------------------------
    // 1. Check if user mentioned an anime
    // --------------------------------

    const mentionedAnime = animeList.find((anime) =>
      userMessage.includes(anime.title.toLowerCase())
    );

    if (mentionedAnime) {
      // Find anime similar by genres
      const sourceGenres = mentionedAnime.genres || [];

      relevantAnime = animeList.filter((anime) => {
        // Don't recommend the anime itself
        if (anime._id.equals(mentionedAnime._id)) {
          return false;
        }

        // For recommendation, prefer Plan to Watch
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
      // --------------------------------
      // 2. No specific anime mentioned
      // --------------------------------

      // Send only Plan to Watch anime
      relevantAnime = animeList.filter((anime) => anime.status === 'Plan to Watch');
    }

    // --------------------------------
    // 3. Limit data sent to Groq
    // --------------------------------

    relevantAnime = relevantAnime.slice(0, 30);

    const library = relevantAnime.map((anime) => ({
      title: anime.title,
      genres: anime.genres,
      favorite: anime.favorite
    }));

    // --------------------------------
    // 4. Ask Groq
    // --------------------------------

    const systemPrompt = `
You are Risuto AI, an anime assistant.

Only answer anime-related questions.

You are given anime from the user's library.

For recommendations:
- ONLY recommend anime from the provided list.
- Prefer anime that match the user's request.
- Keep recommendations short.
- Give a short reason for each recommendation.
- Do not invent anime.
- Do not recommend anime outside the provided list.

If the request is unrelated to anime, respond exactly:
"I can only help with anime-related questions."

Anime available for this request:
${JSON.stringify(library)}
`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',

      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message.trim()
        }
      ],

      temperature: 0.6,
      max_tokens: 250
    });

    const response = completion.choices?.[0]?.message?.content?.trim();

    if (!response) {
      return res.status(500).json({
        message: 'AI could not generate a response.'
      });
    }

    res.status(200).json({
      response
    });
  } catch (error) {
    console.error('AI ERROR:', error);

    res.status(500).json({
      message: 'Something went wrong while contacting Risuto AI.'
    });
  }
};
