'use client';

import React from 'react';
import { X } from 'lucide-react';
import { NoteModel } from '@/store/slices/order/OrderType';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: NoteModel) => void;
}

export function AddNoteModal({ isOpen, onClose, onConfirm }: AddNoteModalProps) {
  const [noteText, setNoteText] = React.useState('');

  const {user} = useSelector((state: RootState) => state.user);

    
  if (!isOpen) return null;

  const handleConfirm = () => {

    const data:NoteModel={
        message: noteText,
        name: user?.name,
        date: new Date().toISOString(),
        user_id: user?._id,
        access: 'admin',
        type: 'note',
    }
    onConfirm(data);
    setNoteText('');
    onClose();
   
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-background shadow-2xl transition-all animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
          <h2 className="text-xl font-bold text-foreground">Add Note</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-foreground/5 transition-colors">
            <X size={20} className="text-foreground/40" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left Column: Timeline */}
          <div className="space-y-6">
            <div className="relative pl-6">
              {/* Timeline Line */}
              <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-border/40" />
              
              <div className="relative">
                {/* Status Dot */}
                <div className="absolute left-[-24px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-foreground shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground/80">Order Initiated</h4>
                  <p className="text-xs font-medium text-foreground/50">
                    Abhay Singh Chauhan <span className="text-foreground/30 mx-1">on</span> 3/31/2026, 12:03:03 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Textarea */}
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Note"
              className="w-full h-32 rounded-2xl border border-border/70 bg-foreground/[0.02] p-4 text-sm font-medium outline-none focus:border-primary/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/60 px-6 py-5 bg-foreground/[0.02]">
          <button
            onClick={onClose}
            className="rounded-xl border border-border/70 bg-background px-6 py-2.5 text-sm font-bold text-foreground/70 hover:bg-foreground/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-black px-8 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
