import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Music, Palette } from "lucide-react";

interface TherapyFilterProps {
  musicTherapy: boolean;
  artTherapy: boolean;
  onMusicTherapyChange: (checked: boolean) => void;
  onArtTherapyChange: (checked: boolean) => void;
}

export const TherapyFilter = ({
  musicTherapy,
  artTherapy,
  onMusicTherapyChange,
  onArtTherapyChange,
}: TherapyFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Music Therapy</span>
        </div>
        <div className="flex items-center gap-2">
          {musicTherapy && (
            <Badge variant="secondary" className="bg-primary-100 text-primary-800">
              Certified
            </Badge>
          )}
          <Switch checked={musicTherapy} onCheckedChange={onMusicTherapyChange} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Art Therapy</span>
        </div>
        <div className="flex items-center gap-2">
          {artTherapy && (
            <Badge variant="secondary" className="bg-primary-100 text-primary-800">
              Certified
            </Badge>
          )}
          <Switch checked={artTherapy} onCheckedChange={onArtTherapyChange} />
        </div>
      </div>
    </div>
  );
};