exports.analyzeComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_GEMINI_API_KEY') {
      return res.json({
        urgency: "High",
        department: "Water Department Suggestion",
        summary: "AI-generated summary: " + description.substring(0, 50) + "...",
        autoResponse: "Thank you for reporting. The appropriate department has been notified."
      });
    }

    const prompt = `Analyze the following complaint:
Title: ${title}
Description: ${description}
Category: ${category}

Provide a JSON response with the exact following keys and no extra formatting or text outside the JSON:
{
  "urgency": "(Low, Medium, High, Critical)",
  "department": "(Suggest responsible department)",
  "summary": "(Short 1-2 sentence summary of the complaint)",
  "autoResponse": "(A polite auto-generated response to the user acknowledging the issue)"
}`;

    const url = `https://openrouter.ai/api/v1/chat/completions`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Complaint System'
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const textResponse = data.choices[0].message.content;
      try {
        // Strip out markdown code blocks if any
        const jsonStr = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiAnalysis = JSON.parse(jsonStr);
        return res.json(aiAnalysis);
      } catch (e) {
        console.error("Failed to parse JSON from AI:", textResponse);
        return res.status(500).json({ error: "Failed to parse AI response" });
      }
    } else {
        return res.status(500).json({ error: "No response from AI", details: data });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
};
