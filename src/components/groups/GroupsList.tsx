
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CareGroup } from "@/types/groups";

interface GroupsListProps {
  groups: CareGroup[];
  onDelete?: (groupId: string) => void;
  onEdit?: (group: CareGroup) => void;
}

export default function GroupsList({ groups, onDelete, onEdit }: GroupsListProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div 
                className="flex-1 cursor-pointer" 
                onClick={() => handleGroupClick(group.id)}
              >
                <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                {group.description && (
                  <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{group.member_count} members</span>
                  <span>•</span>
                  <span>{new Date(group.created_at).toLocaleDateString()}</span>
                  {group.is_public && (
                    <>
                      <span>•</span>
                      <span>Public</span>
                    </>
                  )}
                </div>
              </div>
              {(onDelete || onEdit) && (
                <div className="flex gap-2">
                  {onEdit && group.is_owner && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && group.is_owner && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(group.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
