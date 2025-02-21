import { useEffect, useState } from "react";
import { X, GitBranch, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDevelopmentMode } from "@/contexts/development-mode";

const colors = [
  "text-red-500",
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
  "text-pink-500",
  "text-yellow-500",
  "text-orange-500",
  "text-teal-500",
];

interface BuildStatus {
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface EditHistory {
  component: string;
  changes: string;
  timestamp: string;
  details?: {
    summary: string;
    frontend?: {
      components?: string[];
      styles?: string[];
      features?: string[];
    };
    backend?: {
      api?: string[];
      database?: string[];
      services?: string[];
    };
  };
}

export function DevSuccessApple() {
  const { editHistory, gitInfo, buildStatus } = useDevelopmentMode();
  const [isVisible, setIsVisible] = useState(true);
  const [currentColor, setCurrentColor] = useState(colors[0]);

  // Change color every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setCurrentColor(randomColor);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const statusColor = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-6 bg-black/20">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[450px] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <div className="absolute -top-2 -right-2 z-10">
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col p-8 space-y-6 overflow-hidden">
          {/* Last Edit Time */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Edit: {new Date().toLocaleString()}</span>
          </div>

          {/* Apple Icon */}
          <div className="flex justify-center py-4">
            <div className={`text-8xl transition-colors duration-500 ${currentColor} hover:scale-110 transform transition-transform`}>
              🍎
            </div>
          </div>
          
          {/* Success Message */}
          <div className="text-center space-y-3">
            <p className="font-semibold text-lg">
              If you see this apple, it means we are in good shape! 🚀
            </p>
            <p className="text-sm text-muted-foreground">
              Development Mode Active - Edit monitoring enabled
            </p>
          </div>

          <Separator className="!my-4" />

          {/* Git Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4" />
              <span className="text-sm font-medium">Current Branch:</span>
              <span className="text-sm text-muted-foreground">{gitInfo.branch}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last Commit: {gitInfo.lastCommit}
            </div>
          </div>

          {/* Build Status */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {buildStatus.status === 'success' ? (
                <CheckCircle2 className={`h-4 w-4 ${statusColor[buildStatus.status]}`} />
              ) : (
                <AlertCircle className={`h-4 w-4 ${statusColor[buildStatus.status]}`} />
              )}
              <span className={`text-sm font-medium ${statusColor[buildStatus.status]}`}>
                Build Status: {buildStatus.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {buildStatus.message}
            </div>
          </div>

          <Separator className="!my-4" />

          {/* Edit History */}
          <div className="flex-1 min-h-0">
            <h3 className="font-semibold mb-4">Development History</h3>
            <ScrollArea className="h-[200px] w-full rounded-xl">
              <div className="space-y-4 pr-4">
                {editHistory.map((edit, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{edit.component}</p>
                      <p className="text-sm text-muted-foreground">{edit.changes}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(edit.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {edit.details && (
                      <div className="space-y-2 pl-3 text-sm border-l-2 border-muted-foreground/20">
                        {edit.details.summary && (
                          <p className="text-muted-foreground">{edit.details.summary}</p>
                        )}
                        
                        {edit.details.frontend && (
                          <div className="space-y-1">
                            <p className="font-medium text-xs">Frontend Changes:</p>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {edit.details.frontend.components?.map((component, i) => (
                                <li key={i}>• {component}</li>
                              ))}
                              {edit.details.frontend.styles?.map((style, i) => (
                                <li key={i}>• {style}</li>
                              ))}
                              {edit.details.frontend.features?.map((feature, i) => (
                                <li key={i}>• {feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {edit.details.backend && (
                          <div className="space-y-1">
                            <p className="font-medium text-xs">Backend Changes:</p>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {edit.details.backend.api?.map((api, i) => (
                                <li key={i}>• {api}</li>
                              ))}
                              {edit.details.backend.database?.map((db, i) => (
                                <li key={i}>• {db}</li>
                              ))}
                              {edit.details.backend.services?.map((service, i) => (
                                <li key={i}>• {service}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
