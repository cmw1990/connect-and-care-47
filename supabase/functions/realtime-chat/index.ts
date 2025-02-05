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
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const { text } = await req.json();
    console.log('Processing chat request:', text);

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
            content: 'You are a helpful care assistant AI that provides support and information to caregivers and care recipients. You should be empathetic, clear, and always remind users that you are an AI assistant working with the human care team.'
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
      const error = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', error);
      throw new Error(`Perplexity API error: ${error.error?.message || response.statusText}`);
    }

    // Transform the response into a readable stream
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
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                controller.enqueue(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
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
    console.error('Error in realtime-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "An error occurred while processing your request. Please try again."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});