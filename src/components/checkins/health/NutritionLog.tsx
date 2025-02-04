import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Utensils, Plus } from "lucide-react";
import { useState } from "react";

interface NutritionLogProps {
  nutritionLog: { meal: string; time: string }[];
  onNutritionLogUpdate: (log: { meal: string; time: string }[]) => void;
}

export const NutritionLog = ({ nutritionLog, onNutritionLogUpdate }: NutritionLogProps) => {
  const [newMeal, setNewMeal] = useState("");

  const addMeal = () => {
    if (newMeal.trim()) {
      onNutritionLogUpdate([
        ...nutritionLog,
        { meal: newMeal, time: new Date().toISOString() },
      ]);
      setNewMeal("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Nutrition Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="mealInput">Add Meal or Snack</Label>
          <div className="flex gap-2">
            <Textarea
              id="mealInput"
              value={newMeal}
              onChange={(e) => setNewMeal(e.target.value)}
              placeholder="What did you eat?"
              className="flex-1"
            />
            <Button onClick={addMeal} className="self-end">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {nutritionLog.map((entry, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 rounded-lg flex justify-between items-center"
            >
              <span>{entry.meal}</span>
              <span className="text-sm text-gray-500">
                {new Date(entry.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};