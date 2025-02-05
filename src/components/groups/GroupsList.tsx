import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Trash2, Edit, Clock, MapPin } from "lucide-react";
import type { CareGroup } from "@/types/groups";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

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
      {groups.map((group, index) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <Card 
            className="hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden border border-gray-200 cursor-pointer"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <CardHeader className="bg-gradient-to-r from-primary-100 to-secondary-100 pb-4">
              <CardTitle className="flex justify-between items-center">
                <span className="truncate text-lg font-semibold text-gray-800">{group.name}</span>
                <div className="flex items-center text-sm text-gray-600 bg-white/80 px-2 py-1 rounded-full shadow-sm">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.member_count}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                  {group.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {format(new Date(group.created_at), 'MMM d, yyyy')}</span>
                </div>

                {group.location && (
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{group.location}</span>
                  </div>
                )}

                {showActions && (
                  <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(group);
                        }}
                        className="flex-1 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group.id);
                        }}
                        className="flex-1 hover:bg-red-50 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};