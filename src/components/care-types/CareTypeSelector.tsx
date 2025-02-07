import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Baby, Dog, Heart, Brain, Users } from "lucide-react";
import { motion } from "framer-motion";

const careTypes = [
  {
    id: 'elderly',
    title: 'Senior Care',
    description: 'Find compassionate caregivers for elderly care and companionship',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    id: 'children',
    title: 'Child Care',
    description: 'Connect with experienced babysitters and child care professionals',
    icon: Baby,
    color: 'text-blue-500',
  },
  {
    id: 'special-needs',
    title: 'Special Needs',
    description: 'Specialized care for individuals with unique requirements',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    id: 'pets',
    title: 'Pet Care',
    description: 'Reliable pet sitters and animal care specialists',
    icon: Dog,
    color: 'text-green-500',
  },
  {
    id: 'family',
    title: 'Family Care',
    description: 'Coordinate care for multiple family members',
    icon: Users,
    color: 'text-orange-500',
  },
];

export const CareTypeSelector = () => {
  const navigate = useNavigate();

  const handleCareTypeSelect = (careType: string) => {
    navigate(`/groups/new?type=${careType}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {careTypes.map((type, index) => (
        <motion.div
          key={type.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCareTypeSelect(type.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-gray-100 ${type.color}`}>
                  <type.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4"
                variant="outline"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};