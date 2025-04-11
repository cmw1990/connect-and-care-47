
// This is a placeholder App component
import React from 'react';
import { CareMetrics } from './components/analytics/CareMetrics';
import { CareTeamChat } from './components/care-team/CareTeamChat';

function App() {
  return (
    <div className="p-4 container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Care Platform</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <CareMetrics groupId="group-1" />
        </div>
        <div>
          <CareTeamChat 
            teamId="team-1" 
            onError={(error) => console.error('Chat error:', error)} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
