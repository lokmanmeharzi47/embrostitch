import React from 'react';
import Button from '@/components/ui/Button';

interface RequestOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalName: string;
}

export default function RequestOrderModal({ isOpen, onClose, professionalName }: RequestOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Request Custom Order</h2>
            <p className="text-sm text-success font-medium flex items-center gap-1 mt-1">
               <span className="material-icons text-[16px]">verified</span>
               with {professionalName}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-secondary/50 rounded-full">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="space-y-2">
             <label className="text-sm font-bold text-foreground">Project Details</label>
             <textarea 
               placeholder="Describe your vision, required materials, and specific details..." 
               className="w-full border border-border rounded-lg bg-secondary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 p-3 text-sm min-h-[120px] resize-none"
             ></textarea>
          </div>

          <div className="space-y-3">
             <label className="text-sm font-bold text-foreground">Fabric Sourcing</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border border-primary bg-primary/5 rounded-xl p-4 cursor-pointer relative flex flex-col items-center text-center transition-all">
                   <input type="radio" name="fabric" defaultChecked className="absolute top-3 right-3 text-primary focus:ring-primary" />
                   <span className="material-icons text-primary text-3xl mb-2">local_shipping</span>
                   <span className="text-sm font-bold text-foreground block mb-1">I&apos;ll provide fabric</span>
                   <span className="text-xs text-muted-foreground">You will ship materials to the atelier</span>
                </label>
                <label className="border border-border hover:border-border/80 bg-background rounded-xl p-4 cursor-pointer relative flex flex-col items-center text-center transition-all">
                   <input type="radio" name="fabric" className="absolute top-3 right-3 text-primary focus:ring-primary" />
                   <span className="material-icons text-muted-foreground text-3xl mb-2">content_cut</span>
                   <span className="text-sm font-bold text-foreground block mb-1">{professionalName.split(' ')[0]} provides fabric</span>
                   <span className="text-xs text-muted-foreground">Sourced based on your requirements</span>
                </label>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-foreground">Reference Files</label>
             <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/10 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                   <span className="material-icons text-primary">cloud_upload</span>
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Click to upload reference images</p>
                <p className="text-xs text-muted-foreground">Max 5 files. PNG, JPG or PDF.</p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/20 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="bg-white">Cancel</Button>
          <Button variant="primary">Submit Request</Button>
        </div>

      </div>
    </div>
  );
}
