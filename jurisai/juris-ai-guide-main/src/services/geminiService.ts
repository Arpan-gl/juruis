export const getGeminiResponse = async (query: string): Promise<string> => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      return data.reply;
    } catch (err) {
      console.error('Error:', err);
      return 'An error occurred while contacting the AI.';
    }
  };
  
  