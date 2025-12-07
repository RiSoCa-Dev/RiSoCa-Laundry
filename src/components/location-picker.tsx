'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LocateFixed, Loader2 } from 'lucide-react';
import type { LatLng } from 'leaflet';

// Dynamically import the LocationMap component with SSR disabled.
// This is the crucial step to prevent "window is not defined" errors.
const LocationMap = dynamic(() => import('./location-map').then(mod => mod.LocationMap), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-muted rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="ml-2 text-muted-foreground">Loading Map...</p>
    </div>
  ),
});

const SHOP_LATITUDE = 14.5515;
const SHOP_LONGITUDE = 121.0493;

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (distance: number) => void;
  trigger: React.ReactNode;
}

export function LocationPicker({ open, onOpenChange, onLocationSelect, trigger }: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);

  const handlePositionChange = (pos: LatLng) => {
    // This dynamic import ensures the 'leaflet' package is only loaded client-side
    import('leaflet').then(L => {
        setSelectedPosition(pos);
        const shopLatLng = new L.LatLng(SHOP_LATITUDE, SHOP_LONGITUDE);
        const distanceInMeters = shopLatLng.distanceTo(pos);
        const distanceInKm = distanceInMeters / 1000;
        setCalculatedDistance(distanceInKm);
    });
  };
  
  const handleConfirm = () => {
    onLocationSelect(calculatedDistance);
    onOpenChange(false);
  };
  
  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LocateFixed /> Select Your Location
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">Click on the map to place a pin or use your current location.</p>
              {/* Only render LocationMap when the dialog is open to conserve resources */}
              {open && <LocationMap onPositionChange={handlePositionChange} />}
               <div className="text-center">
                  <p className="text-sm text-muted-foreground">Calculated Distance from Shop</p>
                  <p className="text-lg font-bold">{calculatedDistance.toFixed(2)} km</p>
              </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirm} className="w-full" disabled={!selectedPosition}>
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
