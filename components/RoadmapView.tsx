
import React from 'react';
import { RoadmapModule, RoadmapTopic } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { AwardIcon } from './icons/AwardIcon';

interface RoadmapViewProps {
  roadmap: RoadmapModule[];
  activeTopic: RoadmapTopic | null;
  onSelectTopic: (topic: RoadmapTopic) => void;
  prefetchingTopic: string | null;
  isComplete: boolean;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ roadmap, activeTopic, onSelectTopic, prefetchingTopic, isComplete }) => {
  if (isComplete) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AwardIcon className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Congratulations!</h2>
        <p className="text-slate-600 mt-2">You've completed your learning path. View your certificate on the right!</p>
       </div>
    )
  }
  
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">Your Learning Roadmap</h2>
      {roadmap.length === 0 ? (
        <p className="text-slate-500">No roadmap generated yet.</p>
      ) : (
        <div className="space-y-6">
          {roadmap.map((module, moduleIndex) => (
            <div key={moduleIndex} className="animate-fade-in">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">{module.title}</h3>
              <ul className="space-y-2">
                {module.topics.map((topic, topicIndex) => {
                  const isActive = activeTopic?.title === topic.title;
                  const isPrefetching = prefetchingTopic === topic.title;
                  return (
                    <li key={topicIndex}>
                      <button
                        onClick={() => onSelectTopic(topic)}
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-800 shadow-inner'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <CheckCircleIcon
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 transition-colors ${
                              topic.completed ? 'text-green-500' : 'text-slate-300'
                            }`}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{topic.title}</span>
                            <span className={`text-xs ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                              {topic.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isPrefetching && (
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse-subtle"></div>
                          )}
                          <ChevronRightIcon className={`h-5 w-5 text-slate-400 transition-transform ${isActive ? 'transform translate-x-1' : ''}`} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;