import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, analysisType } = await req.json();
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    let systemPrompt = 'You are a helpful care assistant analyzing care facilities and products.';
    
    // Customize system prompt based on analysis type
    switch (analysisType) {
      case 'sentiment':
        systemPrompt = 'Analyze the sentiment and emotional tone of reviews for care facilities and products. Focus on key concerns and positive aspects.';
        break;
      case 'recommendations':
        systemPrompt = 'Provide personalized recommendations based on specific needs, preferences, and constraints. Consider factors like budget, location, and care requirements.';
        break;
      case 'costBenefit':
        systemPrompt = 'Perform a detailed cost-benefit analysis comparing different care options. Consider both immediate and long-term financial implications.';
        break;
      case 'trends':
        systemPrompt = 'Analyze current market trends and predict future developments in care facilities and products. Focus on emerging technologies and care approaches.';
        break;
    }

    console.log(`Processing ${analysisType} analysis for context: ${context}`);

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `${context}\n\nAnalysis Request: ${message}`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        stream: true,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'chunk',
                      content: parsed.choices[0].delta.content
                    })}\n\n`));
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in care-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});