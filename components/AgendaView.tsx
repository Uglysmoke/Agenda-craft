
import React, { useState } from 'react';
import { MeetingAgenda, AgendaTopic, Stakeholder } from '../types';
import { Stakeholders } from './Stakeholders';
import { Timeline } from './Timeline';
import { PresentationMode } from './PresentationMode';
import { Calendar, Clock, MapPin, Share2, Download, Play } from 'lucide-react';

interface AgendaViewProps {
  agenda: MeetingAgenda;
  onUpdateTopic: (index: number, updatedTopic: Partial<AgendaTopic>) => void;
  onUpdateStakeholder: (index: number, updatedStakeholder: Partial<Stakeholder>) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ agenda, onUpdateTopic, onUpdateStakeholder }) => {
  const [isPresenting, setIsPresenting] = useState(false);

  if (isPresenting) {
    return (
      <PresentationMode 
        agenda={agenda} 
        onExit={() => setIsPresenting(false)} 
        onUpdateTopic={onUpdateTopic}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-3">
            <span className="px-2 py-0.5 bg-blue-50 rounded-md">AI Generated</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {agenda.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{agenda.date || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Starts at {agenda.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Virtual / Room 302</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-100"
          >
            <Play size={18} fill="currentColor" />
            <span>Present</span>
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
            <Download size={20} />
          </button>
        </div>
      </div>

      <hr className="border-slate-100 mb-10" />

      {/* Summary */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Meeting Objective</h2>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed italic">
          "{agenda.summary}"
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Stakeholders</h2>
          <button className="text-blue-600 text-sm font-medium hover:underline">Edit List</button>
        </div>
        <Stakeholders 
          stakeholders={agenda.stakeholders} 
          onUpdateStakeholder={onUpdateStakeholder}
        />
      </section>

      {/* Timeline Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-900">Agenda Timeline</h2>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium">Timeline</button>
            <button className="px-3 py-1.5 text-slate-500 rounded-md text-sm font-medium hover:text-slate-700">Grid</button>
          </div>
        </div>
        <Timeline topics={agenda.topics} startTime={agenda.startTime} />
      </section>
    </div>
  );
};
