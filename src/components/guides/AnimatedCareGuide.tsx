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

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('care_guide_videos')
        .select('video_url')
        .eq('disease', disease)
        .single();

      if (!error && data) {
        setVideoUrl(data.video_url);
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
            <div className="flex items-center justify-center h-full">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};