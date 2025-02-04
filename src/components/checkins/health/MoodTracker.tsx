import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react";

interface MoodTrackerProps {
  moodScore: number | null;
  onMoodSelect: (score: number) => void;
}

export const MoodTracker = ({ moodScore, onMoodSelect }: MoodTrackerProps) => {
  const moods = [
    { score: 5, icon: ThumbsUp, label: "Great", color: "text-green-500" },
    { score: 4, icon: Smile, label: "Good", color: "text-blue-500" },
    { score: 3, icon: Meh, label: "Okay", color: "text-yellow-500" },
    { score: 2, icon: Frown, label: "Not Good", color: "text-orange-500" },
    { score: 1, icon: ThumbsDown, label: "Bad", color: "text-red-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.score}
              variant={moodScore === mood.score ? "default" : "outline"}
              className="flex-1 flex-col gap-2 h-auto py-4"
              onClick={() => onMoodSelect(mood.score)}
            >
              <mood.icon className={`h-6 w-6 ${mood.color}`} />
              <span className="text-sm">{mood.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};