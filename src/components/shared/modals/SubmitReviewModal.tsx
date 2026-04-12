import React from 'react';
import Button from '@/components/ui/Button';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  itemName: string;
}

export default function SubmitReviewModal({ isOpen, onClose, orderId, itemName }: SubmitReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Submit Review</h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
               Order #{orderId} &bull; {itemName}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-secondary/50 rounded-full">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col items-center justify-center py-4 border-b border-border">
             <p className="text-sm font-bold text-foreground mb-3">How was your experience?</p>
             <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                   <button key={star} className="text-muted-foreground hover:text-warning transition-colors cursor-pointer">
                      <span className="material-icons text-4xl">star_border</span>
                   </button>
                ))}
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-foreground">Leave a comment</label>
             <textarea 
               placeholder="Describe the craftsmanship, communication, and overall quality..." 
               className="w-full border border-border rounded-lg bg-secondary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 p-3 text-sm min-h-[120px] resize-none"
             ></textarea>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-foreground">Add Photos (Optional)</label>
             <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-secondary/10 hover:bg-secondary/30 transition-colors cursor-pointer">
                <span className="material-icons text-muted-foreground text-3xl mb-2">add_a_photo</span>
                <p className="text-sm font-bold text-foreground mb-1">Click to upload photos</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (Max 5MB)</p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/20 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="bg-white">Skip for now</Button>
          <Button variant="primary">Submit Review</Button>
        </div>

      </div>
    </div>
  );
}
