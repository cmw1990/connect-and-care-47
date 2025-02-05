import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log('Received request with text:', text);

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    console.log('Making request to Perplexity API...');
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
            content: 'You are a caring and knowledgeable healthcare assistant. Analyze the provided patient information and care group context to offer personalized care guidance. Focus on practical advice, daily care routines, and specific recommendations based on the patient\'s conditions and needs. Keep responses clear, actionable, and empathetic.'
          },
          {
            role: 'user',
            content: text
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
      const error = await response.text();
      console.error('Perplexity API error:', error);
      
      const fallbackMessage = {
        type: 'chunk',
        content: "I apologize, but I'm currently unable to process your request. Here are some general care recommendations:\n\n" +
          "1. Maintain consistent daily routines\n" +
          "2. Keep detailed records of medications and appointments\n" +
          "3. Ensure regular communication between care team members\n" +
          "4. Monitor and document any changes in condition\n" +
          "5. Take breaks and practice self-care as a caregiver\n\n" +
          "Please try again later for more personalized guidance."
      };
      
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(`data: ${JSON.stringify(fallbackMessage)}\n\n`);
          controller.enqueue('data: {"type":"done"}\n\n');
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue('data: {"type":"done"}\n\n');
              break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices?.[0]?.delta?.content) {
                    const content = data.choices[0].delta.content;
                    controller.enqueue(`data: {"type":"chunk","content":"${content.replace(/"/g, '\\"')}"}\n\n`);
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});