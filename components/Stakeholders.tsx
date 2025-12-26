
import React, { useRef } from 'react';
import { Stakeholder } from '../types';
import { Camera } from 'lucide-react';

interface StakeholdersProps {
  stakeholders: Stakeholder[];
  onUpdateStakeholder: (index: number, updatedStakeholder: Partial<Stakeholder>) => void;
}

export const Stakeholders: React.FC<StakeholdersProps> = ({ stakeholders, onUpdateStakeholder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number | null>(null);

  const handleAvatarClick = (index: number) => {
    activeIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIndexRef.current !== null) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUpdateStakeholder(activeIndexRef.current!, { avatarUrl: dataUrl });
        activeIndexRef.current = null;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      {stakeholders.map((person, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-default group">
          <button 
            onClick={() => handleAvatarClick(idx)}
            className="relative w-12 h-12 rounded-full flex-shrink-0 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 transition-all"
          >
            {person.avatarUrl ? (
              <img 
                src={person.avatarUrl} 
                alt={person.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {person.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{person.name}</h4>
            <p className="text-xs text-slate-500 truncate">{person.role}</p>
          </div>
        </div>
      ))}
      <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all text-sm font-medium">
        <span>+ Add Stakeholder</span>
      </button>
    </div>
  );
};
