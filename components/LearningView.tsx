import React, { useState } from 'react';
import { RoadmapTopic, LearningContent, MCQ, ChatMessage } from '../types';
import PracticeSection from './PracticeSection';
import DoubtSolver from './DoubtSolver';
import Spinner from './Spinner';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface LearningViewProps {
  topic: RoadmapTopic | null;
  content: LearningContent | null;
  mcqs: MCQ[];
  isLoading: boolean;
  onMarkComplete: () => void;
  doubtMessages: ChatMessage[];
  onAskDoubt: (doubt: string) => void;
  isDoubtLoading: boolean;
}

type ActiveTab = 'learn' | 'practice';

const LearningView: React.FC<LearningViewProps> = ({
  topic,
  content,
  mcqs,
  isLoading,
  onMarkComplete,
  doubtMessages,
  onAskDoubt,
  isDoubtLoading
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center">
          <Spinner />
          <p className="mt-4 text-slate-600 font-medium">Loading content for "{topic?.title}"...</p>
        </div>
      </div>
    );
  }

  if (!topic || !content) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <LightBulbIcon className="h-16 w-16 text-slate-400 mb-4" />
        <h3 className="text-2xl font-bold text-slate-800">Select a Topic</h3>
        <p className="mt-2 text-slate-500">Choose a topic from your roadmap on the left to begin learning.</p>
      </div>
    );
  }

  return (
    <div key={topic.title} className="relative w-full h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col animate-fade-in">
      <div className="p-6 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-3xl font-bold text-slate-900">{topic.title}</h2>
        <p className="mt-1 text-slate-500">{topic.description}</p>
      </div>

      <div className="flex-grow flex flex-row min-h-0">
        {/* Left Panel: Content */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Tabs */}
          <div className="px-6 border-b border-slate-200 flex-shrink-0">
            <div className="flex space-x-4">
              <TabButton name="Learn" active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} />
              <TabButton name="Practice" active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} />
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-grow overflow-y-auto p-6">
            {activeTab === 'learn' && (
              <div className="prose prose-lg max-w-none prose-indigo">
                <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Explanation</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{content.explanation}</p>
                
                <h3 className="text-xl font-semibold text-slate-800 border-b pb-2 my-6">Examples</h3>
                <ul className="space-y-4">
                  {content.examples.map((example, index) => (
                    <li key={index} className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-lg">
                      <p className="text-slate-700 whitespace-pre-wrap">{example}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'practice' && (
              <PracticeSection mcqs={mcqs} onComplete={onMarkComplete} />
            )}
          </div>
        </div>

        {/* Right Panel: Doubt Solver */}
        <div className="hidden lg:flex w-1/3 border-l border-slate-200 flex-col">
          <DoubtSolver 
            messages={doubtMessages}
            onAsk={onAskDoubt}
            isLoading={isDoubtLoading}
          />
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ name: string; active: boolean; onClick: () => void }> = ({ name, active, onClick }) => (
    <button
      onClick={onClick}
      className={`py-3 px-1 text-lg font-semibold transition-colors duration-200 border-b-2 ${
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {name}
    </button>
);


export default LearningView;