const fetch = require('node-fetch');

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Set this in your .env file

exports.callLLM = async (prompt) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: 'You are a consent policy evaluator under India\'s DPDP Act.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.2
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Groq API error');
  }
  return data.choices[0].message.content;
}; 