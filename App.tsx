
import React, { useState, useCallback, useMemo } from 'react';
import { LearningMaterial, RoadmapModule, LearningContent, MCQ, ChatMessage, RoadmapTopic } from './types';
import { generateRoadmap, generateLearningContent, generateMCQs, answerDoubt } from './services/geminiService';
import Header from './components/Header';
import MaterialInput from './components/MaterialInput';
import RoadmapView from './components/RoadmapView';
import LearningView from './components/LearningView';
import CertificateView from './components/CertificateView';
import Spinner from './components/Spinner';

type AppState = 'INPUT' | 'GENERATING' | 'LEARNING' | 'ERROR';

export default function App() {
  const [appState, setAppState] = useState<AppState>('INPUT');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapModule[]>([]);
  const [activeTopic, setActiveTopic] = useState<RoadmapTopic | null>(null);
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isContentLoading, setIsContentLoading] = useState<boolean>(false);
  const [doubtMessages, setDoubtMessages] = useState<ChatMessage[]>([]);
  const [isDoubtLoading, setIsDoubtLoading] = useState<boolean>(false);

  // Caching and Pre-fetching state
  const [contentCache, setContentCache] = useState<Map<string, { content: LearningContent; mcqs: MCQ[] }>>(new Map());
  const [prefetchingTopic, setPrefetchingTopic] = useState<string | null>(null);

  const flattenedTopics = useMemo(() => roadmap.flatMap(module => module.topics), [roadmap]);

  const isCourseComplete = useMemo(() => {
    if (roadmap.length === 0) return false;
    return roadmap.every(module => module.topics.every(topic => topic.completed));
  }, [roadmap]);

  const prefetchNextTopic = useCallback(async (currentTopic: RoadmapTopic) => {
    const currentIndex = flattenedTopics.findIndex(t => t.title === currentTopic.title);
    if (currentIndex === -1 || currentIndex + 1 >= flattenedTopics.length) {
      return; // No next topic to prefetch
    }

    const nextTopic = flattenedTopics[currentIndex + 1];
    if (contentCache.has(nextTopic.title) || prefetchingTopic === nextTopic.title) {
      return; // Already cached or being prefetched
    }

    setPrefetchingTopic(nextTopic.title);
    try {
      const [content, generatedMcqs] = await Promise.all([
        generateLearningContent(nextTopic.title, learningMaterials),
        generateMCQs(nextTopic.title, learningMaterials)
      ]);
      setContentCache(prevCache => new Map(prevCache).set(nextTopic.title, { content, mcqs: generatedMcqs }));
    } catch (error) {
      console.error(`Failed to prefetch content for ${nextTopic.title}:`, error);
    } finally {
      setPrefetchingTopic(null);
    }
  }, [flattenedTopics, contentCache, prefetchingTopic, learningMaterials]);

  const handleStartLearning = useCallback(async (materials: LearningMaterial[], knowledgeLevel: string) => {
    setLearningMaterials(materials);
    setAppState('GENERATING');
    setErrorMessage('');
    try {
      const generatedRoadmap = await generateRoadmap(materials, knowledgeLevel);
      setRoadmap(generatedRoadmap);
      setAppState('LEARNING');
    } catch (error) {
      console.error("Failed to generate roadmap:", error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred while generating the roadmap.');
      setAppState('ERROR');
    }
  }, []);

  const handleSelectTopic = useCallback(async (topic: RoadmapTopic) => {
    if (activeTopic?.title === topic.title) return;

    setActiveTopic(topic);
    setIsContentLoading(true);
    setLearningContent(null);
    setMcqs([]);

    // Check cache first
    if (contentCache.has(topic.title)) {
      const cachedData = contentCache.get(topic.title)!;
      setLearningContent(cachedData.content);
      setMcqs(cachedData.mcqs);
      setIsContentLoading(false);
      prefetchNextTopic(topic); // Trigger prefetch for the next one
      return;
    }

    try {
      const [content, generatedMcqs] = await Promise.all([
        generateLearningContent(topic.title, learningMaterials),
        generateMCQs(topic.title, learningMaterials)
      ]);
      setLearningContent(content);
      setMcqs(generatedMcqs);
      // Add to cache
      setContentCache(prevCache => new Map(prevCache).set(topic.title, { content, mcqs: generatedMcqs }));
      // Prefetch the next topic
      prefetchNextTopic(topic);
    } catch (error) {
      console.error("Failed to load topic content:", error);
      setLearningContent({ explanation: `Failed to load content for ${topic.title}. Please try again.`, examples: [] });
    } finally {
      setIsContentLoading(false);
    }
  }, [activeTopic, learningMaterials, contentCache, prefetchNextTopic]);

  const handleMarkTopicComplete = (moduleIndex: number, topicIndex: number) => {
    setRoadmap(prevRoadmap => {
      const newRoadmap = JSON.parse(JSON.stringify(prevRoadmap));
      newRoadmap[moduleIndex].topics[topicIndex].completed = true;
      return newRoadmap;
    });
  };

  const handleAskDoubt = async (doubt: string) => {
      const newMessages: ChatMessage[] = [...doubtMessages, { role: 'user', text: doubt }];
      setDoubtMessages(newMessages);
      setIsDoubtLoading(true);

      try {
          const answer = await answerDoubt(doubt, newMessages, learningMaterials, activeTopic?.title || 'general concepts');
          setDoubtMessages(prev => [...prev, { role: 'model', text: answer }]);
      } catch (error) {
          console.error("Failed to get answer for doubt:", error);
          setDoubtMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error trying to answer your question." }]);
      } finally {
          setIsDoubtLoading(false);
      }
  };

  const handleReset = () => {
    setAppState('INPUT');
    setLearningMaterials([]);
    setRoadmap([]);
    setActiveTopic(null);
    setLearningContent(null);
    setMcqs([]);
    setDoubtMessages([]);
    setErrorMessage('');
    setContentCache(new Map());
    setPrefetchingTopic(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'GENERATING':
        return (
          <div className="flex flex-col items-center justify-center h-screen -mt-20">
            <Spinner />
            <p className="text-xl text-slate-600 mt-4 font-medium">Crafting your personalized learning path...</p>
            <p className="text-slate-500 mt-2">This may take a moment. Great things are worth the wait!</p>
          </div>
        );
      case 'LEARNING':
        const courseName = learningMaterials.find(m => m.type === 'topic')?.content || 'Selected Topics';
        return (
          <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
            <aside className="w-full lg:w-1/3 xl:w-1/4 lg:h-full lg:overflow-y-auto rounded-xl bg-white/50 shadow-sm border border-slate-200 p-4">
              <RoadmapView 
                roadmap={roadmap} 
                activeTopic={activeTopic} 
                onSelectTopic={handleSelectTopic} 
                prefetchingTopic={prefetchingTopic}
                isComplete={isCourseComplete} 
              />
            </aside>
            <main className="w-full lg:w-2/3 xl:w-3/4 lg:h-full lg:overflow-y-auto">
             {isCourseComplete ? (
                <CertificateView courseName={courseName} roadmap={roadmap} />
             ) : (
                <LearningView
                  topic={activeTopic}
                  content={learningContent}
                  mcqs={mcqs}
                  isLoading={isContentLoading}
                  onMarkComplete={() => {
                    const moduleIndex = roadmap.findIndex(m => m.topics.some(t => t.title === activeTopic?.title));
                    const topicIndex = roadmap[moduleIndex]?.topics.findIndex(t => t.title === activeTopic?.title);
                    if(moduleIndex !== -1 && topicIndex !== -1) {
                      handleMarkTopicComplete(moduleIndex, topicIndex);
                    }
                  }}
                  doubtMessages={doubtMessages}
                  onAskDoubt={handleAskDoubt}
                  isDoubtLoading={isDoubtLoading}
                />
              )}
            </main>
          </div>
        );
      case 'ERROR':
        return (
          <div className="flex flex-col items-center justify-center text-center h-screen -mt-20">
             <h2 className="text-2xl font-bold text-red-600 mb-4">Generation Failed</h2>
             <p className="text-slate-600 max-w-md mb-6">{errorMessage}</p>
             <button
               onClick={handleReset}
               className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
             >
               Try Again
             </button>
           </div>
        );
      case 'INPUT':
      default:
        return <MaterialInput onStartLearning={handleStartLearning} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header onReset={handleReset} showReset={appState !== 'INPUT'}/>
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}