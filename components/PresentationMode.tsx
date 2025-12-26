
import React, { useState, useEffect, useRef } from 'react';
import { MeetingAgenda, AgendaTopic } from '../types';
import { X, ChevronLeft, ChevronRight, Clock, User, Info, Mic, Square, Play, Pause, Trash2, Volume2 } from 'lucide-react';

interface PresentationModeProps {
  agenda: MeetingAgenda;
  onExit: () => void;
  onUpdateTopic: (index: number, updatedTopic: Partial<AgendaTopic>) => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ agenda, onExit, onUpdateTopic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const totalTopics = agenda.topics.length;
  const currentTopic = agenda.topics[currentIndex];
  const progress = ((currentIndex + 1) / totalTopics) * 100;

  // Navigation Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentIndex < totalTopics - 1) {
          stopPlayback();
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          stopPlayback();
          setCurrentIndex(prev => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalTopics, onExit]);

  // Recording Timer Logic
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Ensure playback stops when changing topics
  useEffect(() => {
    stopPlayback();
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onUpdateTopic(currentIndex, { audioNoteUrl: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record audio notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const deleteAudioNote = () => {
    if (window.confirm("Delete this audio note?")) {
      stopPlayback();
      onUpdateTopic(currentIndex, { audioNoteUrl: undefined });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
            {currentIndex + 1}
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-slate-900">{agenda.title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Presentation Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <span className="text-slate-900">{currentIndex + 1}</span>
            <span>/</span>
            <span>{totalTopics}</span>
          </div>
          <button 
            onClick={onExit}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12 max-w-6xl mx-auto w-full overflow-y-auto">
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
              Topic {currentIndex + 1}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {currentTopic.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-medium">
                  {currentTopic.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Presenter</p>
                    <p className="text-lg font-bold text-slate-800 leading-none">{currentTopic.presenter}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Time Allotted</p>
                    <p className="text-lg font-bold text-slate-800 leading-none">{currentTopic.durationMinutes} Minutes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Audio Note Recorder Card */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Mic size={20} className={isRecording ? "text-red-500 animate-pulse" : "text-blue-400"} />
                   Topic Note
                </h3>
                
                {isRecording ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-4 bg-slate-800/50 rounded-2xl">
                      <div className="flex gap-1.5 mb-3 h-12 items-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div 
                            key={i} 
                            className="w-1.5 bg-blue-500 rounded-full animate-bounce" 
                            style={{ 
                              height: `${20 + Math.random() * 30}px`,
                              animationDelay: `${i * 0.1}s`,
                              animationDuration: '0.6s'
                            }} 
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-mono font-bold text-white tracking-wider">
                        {formatTime(recordingDuration)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Recording...</p>
                    </div>
                    <button 
                      onClick={stopRecording}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 active:scale-[0.98]"
                    >
                      <Square size={18} fill="currentColor" />
                      Stop Recording
                    </button>
                  </div>
                ) : currentTopic.audioNoteUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                          <Volume2 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Audio Note</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Saved to topic</p>
                        </div>
                      </div>
                      <button 
                        onClick={togglePlayback}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
                      >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
                      </button>
                      <audio 
                        ref={audioRef} 
                        src={currentTopic.audioNoteUrl} 
                        onEnded={() => setIsPlaying(false)}
                        className="hidden" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={startRecording}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                      >
                        <Mic size={14} />
                        Rerecord
                      </button>
                      <button 
                        onClick={deleteAudioNote}
                        className="p-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-all border border-red-900/50"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Capture a quick voice summary or decision for this agenda item.
                    </p>
                    <button 
                      onClick={startRecording}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
                    >
                      <Mic size={20} />
                      Start Voice Note
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden group">
                <Info className="absolute -right-4 -top-4 w-32 h-32 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                <h3 className="text-xl font-bold mb-2 relative z-10">Presenter Tip</h3>
                <p className="text-blue-50 leading-relaxed relative z-10 text-lg">
                  Alignment is key. Confirm the consensus before proceeding to the next topic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className="px-8 py-8 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:text-slate-900 disabled:opacity-30 transition-all rounded-xl hover:bg-white border border-transparent hover:border-slate-200"
        >
          <ChevronLeft size={24} />
          <span>Previous</span>
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalTopics }).map((_, i) => (
            <button 
              key={i}
              onClick={() => { stopPlayback(); setCurrentIndex(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 hover:bg-slate-400 w-2'}`}
              title={`Topic ${i + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={() => {
            if (currentIndex < totalTopics - 1) {
              stopPlayback();
              setCurrentIndex(prev => prev + 1);
            } else {
              onExit();
            }
          }}
          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:translate-x-1 active:translate-x-0"
        >
          <span>{currentIndex === totalTopics - 1 ? 'Finish Meeting' : 'Next Topic'}</span>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};
