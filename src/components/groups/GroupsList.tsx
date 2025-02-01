import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight } from "lucide-react";
import type { CareGroup } from "@/types/groups";

interface GroupsListProps {
  groups: CareGroup[];
}

export const GroupsList = ({ groups }: GroupsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Card key={group.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="truncate">{group.name}</span>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{group.member_count}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 line-clamp-2">{group.description}</p>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};