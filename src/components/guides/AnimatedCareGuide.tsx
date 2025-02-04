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
        console.log('Fetching video for disease:', disease);
        
        const { data, error } = await supabase
          .from('care_guide_videos')
          .select('video_url, disease')
          .eq('disease', disease)
          .maybeSingle();

        console.log('Query result:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          setError('Failed to load video');
          return;
        }

        if (!data) {
          console.log('No video found for disease:', disease);
          setError('No video available for this condition');
          return;
        }

        if (!data.video_url) {
          console.log('Video URL is null for disease:', disease);
          setError('Video URL is missing');
          return;
        }

        console.log('Setting video URL:', data.video_url);
        setVideoUrl(data.video_url);
      } catch (err) {
        console.error('Error in fetchVideo:', err);
        setError('Failed to load video');
      }
    };

    fetchVideo();
  }, [disease]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video loading error:', e);
    setError('Failed to load video');
  };

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
              onError={handleVideoError}
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