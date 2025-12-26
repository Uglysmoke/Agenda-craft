
import React from 'react';
import { FileData, User } from '../types';
import { Upload, FileText, Settings, HelpCircle, LogOut, ChevronRight, User as UserIcon } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  files: FileData[];
  onFileSelect: (file: FileData) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, files, onFileSelect, currentUser, onLogout }) => {
  return (
    <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      {/* Branding */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold tracking-tight">AgendaCraft</span>
        </div>

        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 transition-colors hover:border-blue-400 hover:bg-white group cursor-pointer relative"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) onFileUpload(e.dataTransfer.files[0]);
          }}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            onChange={(e) => {
              if (e.target.files?.[0]) onFileUpload(e.target.files[0]);
            }}
          />
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Upload size={20} className="text-slate-600 group-hover:text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Upload doc</p>
            <p className="text-xs text-slate-500 mt-1">PDF, TXT, DOCX</p>
          </div>
        </div>
      </div>

      {/* History / File List */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mb-4 px-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Documents</h3>
        </div>
        <div className="space-y-1">
          {files.map((file, i) => (
            <button
              key={`${file.name}-${i}`}
              onClick={() => onFileSelect(file)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
            >
              <FileText size={18} className="text-slate-400 group-hover:text-blue-600" />
              <span className="truncate flex-1 text-left">{file.name}</span>
              <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          {files.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-slate-400 italic">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-slate-200 bg-slate-100/30">
        <div className="mb-4 px-3 py-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 truncate leading-none" title={currentUser.email}>
              {currentUser.email.split('@')[0]}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white transition-all">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white transition-all">
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
          <div className="pt-2 border-t border-slate-200 mt-2">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
