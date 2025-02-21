import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Video, Mic, MicOff, VideoOff, Phone, Users, MessageSquare } from 'lucide-react';
import { useUser } from '@/lib/hooks/use-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import Twilio Video
import { connect, createLocalVideoTrack, Room, LocalVideoTrack, RemoteParticipant } from 'twilio-video';

interface VideoConsultationProps {
  teamId: string;
  onError: (error: Error) => void;
}

export function VideoConsultation({ teamId, onError }: VideoConsultationProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [room, setRoom] = React.useState<Room | null>(null);
  const [localTrack, setLocalTrack] = React.useState<LocalVideoTrack | null>(null);
  const [participants, setParticipants] = React.useState<RemoteParticipant[]>([]);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ sender: string; content: string }[]>([]);
  const [newMessage, setNewMessage] = React.useState('');

  const localVideoRef = React.useRef<HTMLDivElement>(null);
  const participantRefs = React.useRef<{ [key: string]: HTMLDivElement }>({});

  const startVideo = async () => {
    try {
      // Get Twilio token from your backend
      const response = await fetch('/api/video-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: user?.id,
          room: teamId,
        }),
      });

      const { token } = await response.json();

      // Create local video track
      const track = await createLocalVideoTrack();
      setLocalTrack(track);

      if (localVideoRef.current) {
        const videoElement = track.attach();
        localVideoRef.current.appendChild(videoElement);
      }

      // Connect to the room
      const room = await connect(token, {
        name: teamId,
        tracks: [track],
      });

      setRoom(room);

      // Handle participants
      room.participants.forEach(participant => {
        setParticipants(prevParticipants => [...prevParticipants, participant]);
      });

      room.on('participantConnected', participant => {
        setParticipants(prevParticipants => [...prevParticipants, participant]);
        toast({
          title: 'Participant Joined',
          description: `${participant.identity} joined the consultation`,
        });
      });

      room.on('participantDisconnected', participant => {
        setParticipants(prevParticipants =>
          prevParticipants.filter(p => p !== participant)
        );
        toast({
          title: 'Participant Left',
          description: `${participant.identity} left the consultation`,
        });
      });
    } catch (error) {
      onError(error as Error);
    }
  };

  const endCall = () => {
    if (localTrack) {
      localTrack.stop();
      setLocalTrack(null);
    }
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    setParticipants([]);
  };

  const toggleMute = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach(track => {
        if (isMuted) {
          track.track.enable();
        } else {
          track.track.disable();
        }
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localTrack) {
      if (isVideoOff) {
        localTrack.enable();
      } else {
        localTrack.disable();
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && room) {
      // Send message through Twilio DataTrack or your preferred method
      const message = {
        sender: user?.id || 'Unknown',
        content: newMessage.trim(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Video Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Local Video */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <div ref={localVideoRef} className="absolute inset-0" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant={isMuted ? 'destructive' : 'secondary'}
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff /> : <Mic />}
                  </Button>
                  <Button
                    size="icon"
                    variant={isVideoOff ? 'destructive' : 'secondary'}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff /> : <Video />}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={endCall}
                  >
                    <Phone />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageSquare />
                  </Button>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {participants.map(participant => (
                        <div
                          key={participant.sid}
                          className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                        >
                          <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${participant.identity}`} />
                            <AvatarFallback>
                              {participant.identity.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{participant.identity}</p>
                            <p className="text-xs text-muted-foreground">Connected</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consultation Chat</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    message.sender === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${message.sender}`} />
                    <AvatarFallback>
                      {message.sender.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-2 max-w-[70%] ${
                      message.sender === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center gap-2 p-4">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      {!room && (
        <Button onClick={startVideo} className="w-full">
          Start Consultation
        </Button>
      )}
    </div>
  );
}
