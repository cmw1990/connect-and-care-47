import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('WebSocket connected');

    socket.onopen = () => {
      console.log('Client connected to WebSocket');
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type !== 'message' || !data.text) {
          throw new Error('Invalid message format');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful care assistant that provides support and guidance for caregivers and patients. Your responses should be empathetic, clear, and focused on healthcare and wellbeing.'
              },
              {
                role: 'user',
                content: data.text
              }
            ],
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('OpenAI API error:', response.status, errorData);
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.trim() === 'data: [DONE]') continue;
            
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  socket.send(JSON.stringify({
                    type: 'chunk',
                    content: data.choices[0].delta.content
                  }));
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }

        socket.send(JSON.stringify({ type: 'done' }));
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    return response;
  } catch (error) {
    console.error('Error in realtime-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});