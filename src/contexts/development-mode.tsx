import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface EditHistory {
  component: string;
  changes: string;
  timestamp: string;
  details: {
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
    summary: string;
  };
}

interface GitInfo {
  branch: string;
  lastCommit: string;
}

interface BuildStatus {
  status: 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface DevelopmentModeContextType {
  isDevelopmentMode: boolean;
  editHistory: EditHistory[];
  gitInfo: GitInfo;
  buildStatus: BuildStatus;
  addEdit: (component: string, changes: string, details: EditHistory['details']) => void;
  updateBuildStatus: (status: BuildStatus) => void;
}

const DevelopmentModeContext = createContext<DevelopmentModeContextType | undefined>(undefined);

export function DevelopmentModeProvider({ children }: { children: ReactNode }) {
  const [editHistory, setEditHistory] = useState<EditHistory[]>([{
    component: "Development Success Apple",
    changes: "Enhanced with detailed edit tracking",
    timestamp: new Date().toISOString(),
    details: {
      frontend: {
        components: ["DevSuccessApple", "DevelopmentModeProvider"],
        styles: ["Added dynamic color transitions", "Improved layout structure"],
        features: ["Real-time status updates", "Git branch monitoring"]
      },
      backend: {
        services: ["Added development mode tracking"],
        api: ["Enhanced edit history endpoints"]
      },
      summary: "Implemented comprehensive development monitoring system with detailed edit tracking and status updates"
    }
  }]);
  const [gitInfo, setGitInfo] = useState<GitInfo>({
    branch: 'surf1',
    lastCommit: 'Loading...',
  });
  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    status: 'success',
    message: 'Development server running on port 4001',
    timestamp: new Date().toISOString(),
  });

  const addEdit = (
    component: string,
    changes: string,
    details: EditHistory['details']
  ) => {
    setEditHistory(prev => [
      {
        component,
        changes,
        timestamp: new Date().toISOString(),
        details
      },
      ...prev,
    ]);
  };

  const updateBuildStatus = (status: BuildStatus) => {
    setBuildStatus(status);
  };

  // Fetch git info on mount
  useEffect(() => {
    const fetchGitInfo = async () => {
      try {
        // You can expand this to make actual git commands using the run_command tool
        setGitInfo({
          branch: 'surf1',
          lastCommit: new Date().toLocaleString(),
        });
      } catch (error) {
        console.error('Failed to fetch git info:', error);
      }
    };

    fetchGitInfo();
  }, []);

  return (
    <DevelopmentModeContext.Provider
      value={{
        isDevelopmentMode: true,
        editHistory,
        gitInfo,
        buildStatus,
        addEdit,
        updateBuildStatus,
      }}
    >
      {children}
    </DevelopmentModeContext.Provider>
  );
}

export function useDevelopmentMode() {
  const context = useContext(DevelopmentModeContext);
  if (context === undefined) {
    throw new Error("useDevelopmentMode must be used within a DevelopmentModeProvider");
  }
  return context;
}
