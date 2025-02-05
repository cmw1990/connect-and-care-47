import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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
    const { text } = await req.json();
    console.log('Received request with text:', text);

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful care assistant AI that provides support and information to caregivers and care recipients. Use the provided context about the patient and care group to give relevant and personalized responses.'
          },
          { role: 'user', content: text }
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
      const error = await response.json();
      console.error('Perplexity API error:', error);
      
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('Perplexity API quota exceeded. Please check your billing details.');
      } else if (error.error?.type === 'invalid_api_key') {
        throw new Error('Invalid Perplexity API key. Please check your configuration.');
      }
      
      throw new Error(`Perplexity API error: ${error.error?.message || response.statusText}`);
    }

    // Set up streaming response
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices.length > 0) {
                const content = parsed.choices[0].delta?.content || parsed.choices[0].text;
                if (content) {
                  console.log('Sending chunk:', content);
                  controller.enqueue(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
                }
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    });

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'An error occurred while processing your request.'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});