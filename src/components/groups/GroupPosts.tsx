import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface GroupPostsProps {
  groupId: string;
}

export const GroupPosts = ({ groupId }: GroupPostsProps) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [newPost, setNewPost] = React.useState("");
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("group_posts")
        .select(`
          id,
          content,
          created_at,
          created_by,
          profiles:created_by (
            first_name,
            last_name
          )
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.from("group_posts").insert({
        content: newPost.trim(),
        group_id: groupId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });
      setNewPost("");
      setIsDialogOpen(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !editingPost.content.trim()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("group_posts")
        .update({ content: editingPost.content.trim() })
        .eq("id", editingPost.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      setEditingPost(null);
      setIsDialogOpen(false);
      await fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("group_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      await fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    fetchPosts();
  }, [groupId]);

  return (
    <Card className="border-x-0 rounded-none shadow-none">
      <CardHeader className="px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Posts
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => {
              setEditingPost(null);
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={editingPost ? editingPost.content : newPost}
                  onChange={(e) => editingPost 
                    ? setEditingPost({ ...editingPost, content: e.target.value })
                    : setNewPost(e.target.value)
                  }
                  placeholder="What's on your mind?"
                  rows={4}
                />
                <Button 
                  onClick={editingPost ? handleUpdatePost : handleCreatePost}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? (editingPost ? "Updating..." : "Posting...") 
                    : (editingPost ? "Update Post" : "Post")
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg border space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">
                  {post.profiles?.first_name} {post.profiles?.last_name}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingPost(post);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm">{post.content}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};