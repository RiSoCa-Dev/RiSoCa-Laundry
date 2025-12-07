'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Statically import marker images to prevent 404 errors in Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon path in Next.js
// This needs to be done once in a client-side context
const DefaultIcon = L.icon({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


const SHOP_LATITUDE = 14.5515;
const SHOP_LONGITUDE = 121.0493;

function DraggableMarker({ onPositionChange }: { onPositionChange: (pos: LatLng) => void }) {
  const [position, setPosition] = useState<LatLng>(new LatLng(SHOP_LATITUDE, SHOP_LONGITUDE));

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng);
    },
    locationfound(e) {
        map.flyTo(e.latlng, map.getZoom());
        setPosition(e.latlng);
        onPositionChange(e.latlng);
    }
  });

  useEffect(() => {
    // Trigger location search on initial load
    map.locate();
  }, [map]);

  const handleDragEnd = (event: L.DragEndEvent) => {
    const marker = event.target;
    const newPosition = marker.getLatLng();
    setPosition(newPosition);
    onPositionChange(newPosition);
  };

  return position === null ? null : (
    <Marker 
        position={position} 
        draggable={true}
        eventHandlers={{
            dragend: handleDragEnd,
        }}
    >
    </Marker>
  );
}

export function LocationMap({ onPositionChange }: { onPositionChange: (pos: LatLng) => void }) {
    const [isClient, setIsClient] = useState(false);
    const [mapKey, setMapKey] = useState('server');
    
    useEffect(() => {
        setIsClient(true);
        // Using a stable string key that's set once on client mount
        setMapKey('client-map'); 
    }, []);

    // The key on MapContainer forces a re-render, which is essential
    // for re-initializing the map when the dialog is re-opened.
    // The isClient check prevents server-side rendering.
    if (!isClient) {
      return null;
    }

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden relative border">
             <MapContainer
                key={mapKey} // Stable key to prevent unnecessary re-initialization
                center={[SHOP_LATITUDE, SHOP_LONGITUDE]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker onPositionChange={onPositionChange} />
            </MapContainer>
        </div>
    );
}
