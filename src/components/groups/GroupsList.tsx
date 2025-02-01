import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Trash2, Edit } from "lucide-react";
import type { CareGroup } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";

interface GroupsListProps {
  groups: CareGroup[];
  onDelete?: (groupId: string) => void;
  onEdit?: (group: CareGroup) => void;
  showActions?: boolean;
}

export const GroupsList = ({ groups, onDelete, onEdit, showActions = true }: GroupsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async (groupId: string) => {
    try {
      if (!onDelete) return;
      onDelete(groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete care group",
        variant: "destructive",
      });
    }
  };

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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
              {showActions && (
                <>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(group)}
                      className="shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(group.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};