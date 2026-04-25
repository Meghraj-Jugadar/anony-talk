const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

const getAIReply = async (title, content) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate anonymous advice assistant on AnonyTalk. Give a short, empathetic, helpful reply in 2-3 sentences. Be warm and supportive.',
        },
        { role: 'user', content: `Title: ${title}\n\n${content}` },
      ],
      max_tokens: 150,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq AI reply error:', err.message);
    return null;
  }
};

const getChatResponse = async (messages, postContext) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a compassionate AI companion on AnonyTalk, an anonymous advice platform. 
You are chatting with someone about this post:
Title: ${postContext.title}
Content: ${postContext.content}
Be empathetic, supportive, and helpful. Keep responses concise (2-4 sentences).`,
        },
        ...messages,
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq chat error:', err.message);
    return 'I am here to listen. Could you tell me more about how you are feeling?';
  }
};

module.exports = { getAIReply, getChatResponse };
