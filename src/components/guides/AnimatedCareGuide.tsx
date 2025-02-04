import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnimatedGuideProps {
  disease: string;
  description: string;
}

export const AnimatedCareGuide = ({ disease, description }: AnimatedGuideProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateVideo = async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase client to invoke the Edge Function
      const { data, error } = await supabase.functions.invoke('generate-care-guide', {
        body: {
          disease,
          description
        }
      });

      if (error) {
        throw error;
      }

      setVideoUrl(data.videoUrl);
      
      toast({
        title: "Success",
        description: "Care guide video has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Error",
        description: "Failed to generate care guide video",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        {videoUrl ? (
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <video 
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2"
              onClick={generateVideo}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={generateVideo} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Generate Care Guide Video
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};