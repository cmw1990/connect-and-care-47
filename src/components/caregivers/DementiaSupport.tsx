
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Book, Users, Heart, Calendar, Image, MessageCircle } from "lucide-react";
import { DementiaProfile, DementiaTopicCard } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

interface DementiaSupportProps {
  onProfileUpdate: (profile: Partial<DementiaProfile>) => void;
}

export function DementiaSupport({ onProfileUpdate }: DementiaSupportProps) {
  const [activeTab, setActiveTab] = useState("communication");
  const { toast } = useToast();
  
  const topicCards: DementiaTopicCard[] = [
    {
      id: "1",
      title: "Family Photo Album",
      category: "memories",
      content: "Looking through family photos together and sharing stories",
      visual_aids: ["family_album.jpg"],
      difficulty_level: "easy",
      engagement_duration: 20,
      success_indicators: ["Smiles", "Shares memories", "Points to familiar faces"]
    },
    {
      id: "2",
      title: "Garden Activities",
      category: "activities",
      content: "Gentle gardening and plant care activities",
      difficulty_level: "medium",
      engagement_duration: 30,
      success_indicators: ["Shows interest in plants", "Follows simple instructions", "Enjoys sensory experience"]
    }
  ];

  const handleTopicCardSelect = (card: DementiaTopicCard) => {
    toast({
      title: "Topic Card Selected",
      description: `${card.title} has been added to your activities`,
    });
  };

  const [comfortTopics, setComfortTopics] = useState<string[]>([]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Dementia Support Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="communication">
              <MessageCircle className="h-4 w-4 mr-2" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Calendar className="h-4 w-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="memories">
              <Image className="h-4 w-4 mr-2" />
              Memory Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communication">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Preferred Name</Label>
                  <Input 
                    placeholder="Enter preferred name"
                    onChange={(e) => onProfileUpdate({
                      communication_preferences: {
                        preferred_name: e.target.value,
                        preferred_language: "English",
                        communication_style: "verbal",
                        comfort_topics: comfortTopics
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Comfort Topics</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Family", "Garden", "Music", "Pets", "Cooking"].map((topic) => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          const newTopics = [...comfortTopics, topic];
                          setComfortTopics(newTopics);
                          onProfileUpdate({
                            communication_preferences: {
                              preferred_name: "",
                              preferred_language: "English",
                              communication_style: "verbal",
                              comfort_topics: newTopics
                            }
                          });
                          toast({
                            title: "Topic Added",
                            description: `${topic} added to comfort topics`,
                          });
                        }}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <ScrollArea className="h-[400px]">
              <div className="grid gap-4">
                {topicCards.map((card) => (
                  <Card key={card.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-sm text-gray-500">{card.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {card.difficulty_level}
                          </span>
                          <span className="text-xs text-gray-500">
                            {card.engagement_duration} mins
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTopicCardSelect(card)}
                      >
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="memories">
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                <Book className="h-4 w-4 mr-2" />
                Create Memory Book
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Add Family Members
              </Button>
              <Button className="w-full" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Important Life Events
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
