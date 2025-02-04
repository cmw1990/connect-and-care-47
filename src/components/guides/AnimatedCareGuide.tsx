import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnimatedGuideProps {
  disease: string;
  description: string;
}

export const AnimatedCareGuide = ({ disease, description }: AnimatedGuideProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // Log the query for debugging
        console.log('Fetching video for disease:', disease);
        
        const { data, error } = await supabase
          .from('care_guide_videos')
          .select('video_url')
          .ilike('disease', disease) // Using ilike for case-insensitive matching
          .maybeSingle();

        if (error) {
          console.error('Error fetching video:', error);
          setError('Failed to load video');
          return;
        }

        if (data) {
          console.log('Video data found:', data);
          setVideoUrl(data.video_url);
        } else {
          console.log('No video found for disease:', disease);
          setError('No video available for this condition');
        }
      } catch (err) {
        console.error('Error in fetchVideo:', err);
        setError('Failed to load video');
      }
    };

    fetchVideo();
  }, [disease]);

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {disease} Care Guide
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
          {videoUrl ? (
            <video 
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full flex-col gap-2">
              <Play className="h-12 w-12 text-muted-foreground" />
              {error && <p className="text-sm text-muted-foreground">{error}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};