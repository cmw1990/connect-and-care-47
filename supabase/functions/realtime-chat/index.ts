import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { text } = await req.json();
    console.log('Received request with text:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      // Handle specific error cases
      if (error.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
      }
      
      throw new Error(error.error?.message || 'Failed to get response from OpenAI API');
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          let accumulatedMessage = '';
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (accumulatedMessage) {
                const safeMessage = accumulatedMessage
                  .replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t');
                controller.enqueue(`data: {"type":"chunk","content":"${safeMessage}"}\n\n`);
              }
              controller.enqueue('data: {"type":"done"}\n\n');
              break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  const parsed = JSON.parse(data);
                  if (parsed.choices?.[0]?.delta?.content) {
                    const content = parsed.choices[0].delta.content;
                    accumulatedMessage += content;
                    const safeContent = content
                      .replace(/\\/g, '\\\\')
                      .replace(/"/g, '\\"')
                      .replace(/\n/g, '\\n')
                      .replace(/\r/g, '\\r')
                      .replace(/\t/g, '\\t');
                    controller.enqueue(`data: {"type":"chunk","content":"${safeContent}"}\n\n`);
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                  console.error('Problematic line:', line);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
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