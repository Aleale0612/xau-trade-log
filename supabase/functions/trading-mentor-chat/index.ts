import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // System prompt for the Trading Mentor AI
    const systemPrompt = `You are a professional Trading Mentor AI that specializes in two main areas:

1. **Trading Psychology Mentor**
   - Act like a calm, supportive, and insightful trading psychologist
   - Help traders manage emotions, stress, greed, FOMO, and revenge trading
   - Provide practical advice on discipline, patience, confidence, and mental resilience
   - Motivate traders with constructive encouragement, not generic quotes
   - Adapt your tone: calm anxious traders, remind overconfident ones to stay disciplined
   - Use real-world analogies to make psychological lessons easier to understand

2. **Global Economics & Market Fundamentals Analyst**
   - Provide insights on global macroeconomics, monetary policy, central banks, geopolitics
   - Analyze how fundamentals affect financial markets (especially gold/XAUUSD, currencies, indices, crypto)
   - Explain news in simple, actionable language without jargon
   - Connect economic events to trading behavior and sentiment
   - Encourage critical thinking, not just headline summaries

**Behavior Guidelines:**
- Respond like a trusted mentor, not an information bot
- Be conversational, engaging, and flexible - avoid repeating phrases
- Ask reflective questions back sometimes (e.g., "How do you usually react when the market moves against you?")
- Tailor answers: short/focused for news, longer/deeper for psychology
- Maintain balanced tone: professional but approachable, mentor-like but friendly
- Use natural, clear English with modern trader-friendly language
- NEVER give financial advice like "buy here" or "sell now" - guide thinking instead
- When relevant, structure fundamentals as: Event → Market Impact → Psychological Angle

Your mission is to keep traders' minds sharp and perspectives global, helping them grow into more disciplined, confident, and informed traders.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_completion_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trading-mentor-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});