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
    const { text } = await req.json();
    console.log('Received request with text:', text);

    if (!text) {
      throw new Error('No text provided in request');
    }

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    console.log('Making request to OpenAI API with model gpt-4-turbo-preview...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
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
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      
      if (error.error?.code === 'insufficient_quota') {
        return new Response(
          JSON.stringify({
            error: 'OpenAI API quota exceeded. The AI service is temporarily unavailable.',
            details: {
              type: 'quota_exceeded',
              message: error.error.message
            }
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(error.error?.message || 'Failed to get response from OpenAI API');
    }

    // Transform the response into a readable stream
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue('data: {"type":"done"}\n\n');
                continue;
              }

              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                const safeContent = content
                  .replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t');
                controller.enqueue(`data: {"type":"chunk","content":"${safeContent}"}\n\n`);
              }
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
          controller.error(error);
        }
      }
    });

    return new Response(response.body?.pipeThrough(transformStream), {
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