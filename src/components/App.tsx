// src/components/App.tsx
import React, { useState } from 'react';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
}

export const App: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: '1', name: 'Lead', color: '#718096' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting', color: '#9F7AEA' },
    { id: '4', name: 'Closed', color: '#48BB78' }
  ]);

  const [showAddStage, setShowAddStage] = useState(false);
  const [newStageName, setNewStageName] = useState('');

  const addStage = () => {
    if (newStageName.trim()) {
      setStages([...stages, {
        id: Date.now().toString(),
        name: newStageName,
        color: '#718096'
      }]);
      setNewStageName('');
      setShowAddStage(false);
    }
  };

  return (
    <div className="w-96 p-4 bg-gray-50">
      <h1 className="text-xl font-bold mb-4">Gmail CRM Pipeline</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Pipeline Stages</h2>
        <div className="space-y-2">
          {stages.map(stage => (
            <div 
              key={stage.id}
              className="flex items-center p-2 bg-white rounded shadow"
              style={{ borderLeft: `4px solid ${stage.color}` }}
            >
              <span className="flex-1">{stage.name}</span>
              <button 
                className="text-red-500 hover:text-red-700"
                onClick={() => setStages(stages.filter(s => s.id !== stage.id))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAddStage ? (
        <div className="space-y-2">
          <input
            type="text"
            value={newStageName}
            onChange={(e) => setNewStageName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Stage name"
          />
          <div className="flex space-x-2">
            <button 
              onClick={addStage}
              className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
            <button 
              onClick={() => setShowAddStage(false)}
              className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowAddStage(true)}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Add Stage
        </button>
      )}
    </div>
  );
};