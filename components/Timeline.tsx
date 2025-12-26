
import React from 'react';
import { AgendaTopic } from '../types';
import { Clock, User, ChevronDown } from 'lucide-react';

interface TimelineProps {
  topics: AgendaTopic[];
  startTime: string;
}

export const Timeline: React.FC<TimelineProps> = ({ topics, startTime }) => {
  // Helper to calculate time strings
  const calculateTimes = () => {
    let currentMinutes = 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startH || 9, startM || 0, 0);

    return topics.map((topic) => {
      const topicStartTime = new Date(startDate.getTime() + currentMinutes * 60000);
      currentMinutes += topic.durationMinutes;
      const topicEndTime = new Date(startDate.getTime() + currentMinutes * 60000);
      
      const format = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return {
        start: format(topicStartTime),
        end: format(topicEndTime),
      };
    });
  };

  const times = calculateTimes();

  return (
    <div className="relative">
      {/* Central Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 transform -translate-x-1/2" />

      <div className="space-y-12">
        {topics.map((topic, index) => (
          <div key={index} className="relative pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500 transform -translate-x-1/2 z-10 shadow-sm group-hover:scale-125 transition-transform" />
            
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* Time Indicator */}
              <div className="w-24 shrink-0 pt-0.5">
                <p className="text-sm font-bold text-slate-900">{times[index].start}</p>
                <p className="text-xs text-slate-400 font-medium">{topic.durationMinutes} min</p>
              </div>

              {/* Content Card */}
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {topic.title}
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600">
                    <ChevronDown size={20} />
                  </button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {topic.description}
                </p>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Presenter</p>
                      <p className="text-sm font-semibold text-slate-700 leading-none">{topic.presenter}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 border border-slate-100">
                    <Clock size={12} />
                    <span>Ends at {times[index].end}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Closing Node */}
        <div className="relative pl-12 pb-8">
           <div className="absolute left-4 top-1.5 w-4 h-4 rounded-full bg-slate-100 border-4 border-slate-200 transform -translate-x-1/2 z-10" />
           <p className="text-sm font-bold text-slate-400">Meeting Concludes</p>
        </div>
      </div>
    </div>
  );
};
