
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AgendaView } from './components/AgendaView';
import { Chatbot } from './components/Chatbot';
import { AuthForm } from './components/AuthForm';
import { MeetingAgenda, FileData, AgendaTopic, Stakeholder, User } from './types';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { Loader2, Plus, Layout } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAgenda, setCurrentAgenda] = useState<MeetingAgenda | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser(session.user);
    }
    setIsAuthChecking(false);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const newFile = { name: file.name, type: file.type, content };
        setFiles(prev => [newFile, ...prev]);

        const agenda = await geminiService.generateAgenda(content, file.name, file.type);
        setCurrentAgenda(agenda);
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      setError("Failed to process document. Please try a different file.");
      setIsProcessing(false);
    }
  }, []);

  const handleUpdateTopic = useCallback((index: number, updatedTopic: Partial<AgendaTopic>) => {
    setCurrentAgenda(prev => {
      if (!prev) return null;
      const newTopics = [...prev.topics];
      newTopics[index] = { ...newTopics[index], ...updatedTopic };
      return { ...prev, topics: newTopics };
    });
  }, []);

  const handleUpdateStakeholder = useCallback((index: number, updatedStakeholder: Partial<Stakeholder>) => {
    setCurrentAgenda(prev => {
      if (!prev) return null;
      const newStakeholders = [...prev.stakeholders];
      newStakeholders[index] = { ...newStakeholders[index], ...updatedStakeholder };
      return { ...prev, stakeholders: newStakeholders };
    });
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentAgenda(null);
    setFiles([]);
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm onAuthSuccess={setCurrentUser} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar 
        onFileUpload={handleFileUpload} 
        files={files} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onFileSelect={(f) => {
          setIsProcessing(true);
          geminiService.generateAgenda(f.content, f.name, f.type).then(res => {
            setCurrentAgenda(res);
            setIsProcessing(false);
          });
        }}
      />

      <main className="flex-1 overflow-y-auto relative bg-white">
        {!currentAgenda && !isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Layout size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome to AgendaCraft AI</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Hi <span className="text-blue-600 font-bold">{currentUser.email.split('@')[0]}</span>! Upload a project brief, meeting transcript, or brainstorming doc to automatically generate a structured agenda.
            </p>
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 shadow-sm shadow-blue-200">
              <Plus size={20} />
              <span>Upload Document to Start</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }} 
              />
            </label>
          </div>
        ) : isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <div className="text-center">
              <p className="text-lg font-medium text-slate-900">Architecting your meeting...</p>
              <p className="text-sm text-slate-500">Gemini is analyzing stakeholders and defining topics.</p>
            </div>
          </div>
        ) : (
          <AgendaView 
            agenda={currentAgenda!} 
            onUpdateTopic={handleUpdateTopic} 
            onUpdateStakeholder={handleUpdateStakeholder}
          />
        )}
      </main>

      {currentAgenda && <Chatbot agenda={currentAgenda} />}

      {error && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-900 font-bold hover:underline">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default App;
