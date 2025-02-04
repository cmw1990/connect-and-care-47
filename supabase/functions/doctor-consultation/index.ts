import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultationRequest {
  groupId: string;
  patientData: {
    symptoms: string[];
    vitalSigns: Record<string, number>;
    medicalHistory: string[];
  };
  consultationType: string;
  doctorNotes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { groupId, patientData, consultationType, doctorNotes }: ConsultationRequest = await req.json();

    // Get patient info and medical history
    const { data: patientInfo, error: patientError } = await supabase
      .from('patient_info')
      .select('*')
      .eq('group_id', groupId)
      .single();

    if (patientError) throw patientError;

    // Prepare the consultation analysis prompt
    const prompt = `As a medical professional, analyze the following patient data and provide a detailed consultation response:

Patient History:
${JSON.stringify(patientInfo.basic_info)}

Current Symptoms:
${patientData.symptoms.join(', ')}

Vital Signs:
${Object.entries(patientData.vitalSigns).map(([key, value]) => `${key}: ${value}`).join('\n')}

Medical History:
${patientData.medicalHistory.join(', ')}

Doctor's Notes:
${doctorNotes || 'None provided'}

Please provide:
1. Initial assessment
2. Potential diagnoses
3. Recommended tests
4. Treatment suggestions
5. Follow-up recommendations
6. Any urgent concerns that need immediate attention`;

    // Get AI analysis
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an experienced medical professional providing consultation analysis and recommendations.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to get AI analysis');
    }

    const analysis = await aiResponse.json();
    const consultationAnalysis = analysis.choices[0].message.content;

    // Store the consultation record
    const { data: consultation, error: consultationError } = await supabase
      .from('medical_consultations')
      .insert({
        group_id: groupId,
        consultation_type: consultationType,
        diagnosis: consultationAnalysis,
        treatment_plan: {
          recommendations: consultationAnalysis,
          aiAnalysis: true,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (consultationError) throw consultationError;

    console.log('Successfully processed medical consultation:', consultation.id);

    return new Response(
      JSON.stringify({
        consultation,
        analysis: consultationAnalysis
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Error in doctor-consultation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});