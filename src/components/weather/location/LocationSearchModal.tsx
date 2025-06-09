
import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EnhancedLocationSearch from './EnhancedLocationSearch';

interface LocationSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-white/20 text-white max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                <MapPin className="w-5 h-5 text-blue-200" />
              </div>
              Add Custom Location
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-blue-200 text-sm">
            Search for any location worldwide to add to your weather dashboard
          </p>
        </DialogHeader>
        
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <EnhancedLocationSearch 
            onLocationAdded={() => onOpenChange(false)}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSearchModal;
