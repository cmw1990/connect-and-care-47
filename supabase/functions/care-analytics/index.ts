import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userType, groupId, metricType, data } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate metrics based on input data
    const metrics = calculateMetrics(data);

    // Store analytics results
    const { error } = await supabase
      .from('care_analytics')
      .insert({
        group_id: groupId,
        metric_type: metricType,
        metric_value: metrics,
        recorded_at: new Date().toISOString()
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, metrics }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in care-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

function calculateMetrics(data: any) {
  const physical = calculatePhysicalHealth(data);
  const mental = calculateMentalHealth(data);
  const mood = calculateMoodScore(data);
  const activity = calculateActivityLevel(data);

  return {
    physical,
    mental,
    mood,
    activity
  };
}

function calculatePhysicalHealth(data: any): number {
  const {
    vitalSigns = {},
    sleepHours = 0,
    exerciseMinutes = 0,
    medicationAdherence = 0
  } = data;

  // Normalize each component to a 0-100 scale
  const vitalScore = calculateVitalScore(vitalSigns);
  const sleepScore = (sleepHours / 8) * 100; // Assuming 8 hours is optimal
  const exerciseScore = (exerciseMinutes / 30) * 100; // Assuming 30 minutes is target
  const medicationScore = medicationAdherence;

  // Weight the components
  return Math.round(
    (vitalScore * 0.4) +
    (sleepScore * 0.2) +
    (exerciseScore * 0.2) +
    (medicationScore * 0.2)
  );
}

function calculateMentalHealth(data: any): number {
  const {
    cognitiveScore = 0,
    socialInteractions = [],
    stressLevel = 50,
    moodStability = 50
  } = data;

  const socialScore = calculateSocialScore(socialInteractions);
  const stressScore = 100 - stressLevel; // Invert stress level
  
  return Math.round(
    (cognitiveScore * 0.3) +
    (socialScore * 0.3) +
    (stressScore * 0.2) +
    (moodStability * 0.2)
  );
}

function calculateMoodScore(data: any): number {
  const {
    reportedMood = 50,
    activityEngagement = 0,
    socialConnections = 0,
    sleepQuality = 0
  } = data;

  return Math.round(
    (reportedMood * 0.4) +
    (activityEngagement * 0.2) +
    (socialConnections * 0.2) +
    (sleepQuality * 0.2)
  );
}

function calculateActivityLevel(data: any): number {
  const {
    dailySteps = 0,
    exerciseMinutes = 0,
    activeHours = 0,
    mobilityScore = 0
  } = data;

  const stepScore = Math.min((dailySteps / 10000) * 100, 100);
  const exerciseScore = Math.min((exerciseMinutes / 30) * 100, 100);
  const activeScore = (activeHours / 12) * 100;

  return Math.round(
    (stepScore * 0.3) +
    (exerciseScore * 0.3) +
    (activeScore * 0.2) +
    (mobilityScore * 0.2)
  );
}

function calculateVitalScore(vitalSigns: any): number {
  const {
    heartRate = 75,
    bloodPressure = { systolic: 120, diastolic: 80 },
    temperature = 98.6,
    oxygenLevel = 98
  } = vitalSigns;

  // Normalize each vital sign to a 0-100 scale
  const heartRateScore = calculateHeartRateScore(heartRate);
  const bpScore = calculateBloodPressureScore(bloodPressure);
  const tempScore = calculateTemperatureScore(temperature);
  const oxygenScore = calculateOxygenScore(oxygenLevel);

  return Math.round(
    (heartRateScore * 0.25) +
    (bpScore * 0.25) +
    (tempScore * 0.25) +
    (oxygenScore * 0.25)
  );
}

function calculateHeartRateScore(hr: number): number {
  // Optimal range: 60-100 bpm
  if (hr >= 60 && hr <= 100) return 100;
  if (hr < 60) return Math.max(0, (hr / 60) * 100);
  return Math.max(0, 100 - ((hr - 100) / 40) * 100);
}

function calculateBloodPressureScore(bp: { systolic: number; diastolic: number }): number {
  // Optimal: 120/80
  const systolicScore = 100 - Math.abs(bp.systolic - 120) / 1.2;
  const diastolicScore = 100 - Math.abs(bp.diastolic - 80) / 0.8;
  return Math.round((systolicScore + diastolicScore) / 2);
}

function calculateTemperatureScore(temp: number): number {
  // Optimal: 98.6°F
  return Math.max(0, 100 - Math.abs(temp - 98.6) * 10);
}

function calculateOxygenScore(oxygen: number): number {
  // Optimal: >= 95%
  return oxygen >= 95 ? 100 : Math.max(0, (oxygen / 95) * 100);
}

function calculateSocialScore(interactions: any[]): number {
  if (!interactions.length) return 0;
  
  const totalScore = interactions.reduce((sum, interaction) => {
    const quality = interaction.quality || 0;
    const duration = interaction.duration || 0;
    return sum + (quality * duration);
  }, 0);

  return Math.min(100, (totalScore / (interactions.length * 100)) * 100);
}