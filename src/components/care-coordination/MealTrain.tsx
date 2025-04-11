
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Utensils, Clock, Calendar, Users } from 'lucide-react';

interface Meal {
  id: string;
  date: Date;
  time: string;
  dish: string;
  preparedBy: string;
  servings: number;
  dietaryNotes: string;
  status: 'scheduled' | 'delivered' | 'cancelled';
}

interface NewMealState {
  date: Date;
  time?: string;
  dish?: string;
  preparedBy?: string;
  servings?: number;
  dietaryNotes?: string;
  status: 'scheduled' | 'delivered' | 'cancelled';
}

export const MealTrain = () => {
  const { toast } = useToast();
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [isAddingMeal, setIsAddingMeal] = React.useState(false);
  const [newMeal, setNewMeal] = React.useState<NewMealState>({
    date: new Date(),
    status: 'scheduled',
  });

  const handleAddMeal = () => {
    if (!newMeal.dish || !newMeal.time) {
      toast({
        title: "Invalid Meal",
        description: "Please complete all required fields",
        variant: 'destructive',
      });
      return;
    }

    const meal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      date: newMeal.date || new Date(),
      time: newMeal.time,
      dish: newMeal.dish,
      preparedBy: newMeal.preparedBy || '',
      servings: newMeal.servings || 1,
      dietaryNotes: newMeal.dietaryNotes || '',
      status: 'scheduled',
    };

    setMeals([...meals, meal]);
    setIsAddingMeal(false);
    setNewMeal({
      date: new Date(),
      status: 'scheduled',
    });

    toast({
      title: "Meal Added",
      description: "The meal has been added to the schedule",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meal Train</CardTitle>
          <CardDescription>Coordinate meals for your care recipient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Utensils className="h-5 w-5 text-primary" />
                <span>{meals.length} Total Meals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{meals.filter(m => m.status === 'scheduled').length} Scheduled</span>
              </div>
            </div>
            <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
              <DialogTrigger asChild>
                <Button>
                  <Utensils className="mr-2 h-4 w-4" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Meal</DialogTitle>
                  <DialogDescription>
                    Add a meal to the schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dish">Dish</Label>
                    <Input
                      id="dish"
                      value={newMeal.dish || ''}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, dish: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMeal.time || ''}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, time: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={newMeal.servings || 1}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, servings: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="dietaryNotes">
                      Dietary Notes
                    </Label>
                    <Input
                      id="dietaryNotes"
                      value={newMeal.dietaryNotes || ''}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, dietaryNotes: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleAddMeal}>
                    Add Meal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {meals.map((meal) => (
              <Card key={meal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        <h4 className="font-medium">{meal.dish}</h4>
                      </div>
                      <div className="flex space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{meal.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{meal.servings} Servings</span>
                        </div>
                      </div>
                      {meal.dietaryNotes && (
                        <p className="text-sm text-gray-500">{meal.dietaryNotes}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const updatedMeals = meals.map((m) =>
                          m.id === meal.id
                            ? { ...m, status: 'delivered' as const }
                            : m
                        );
                        setMeals(updatedMeals);
                      }}
                      disabled={meal.status === 'delivered'}
                    >
                      {meal.status === 'delivered'
                        ? "Delivered"
                        : "Mark Delivered"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
