import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

interface MapViewProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  address,
  zoom = 15,
  height = '250px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
   
      leafletMap.current = L.map(mapRef.current).setView([latitude, longitude], zoom);
      

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      

      const marker = L.marker([latitude, longitude]).addTo(leafletMap.current);
      
      if (address) {
        marker.bindPopup(address).openPopup();
      }
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [latitude, longitude, address, zoom]);
  

  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.setView([latitude, longitude], zoom);
      

      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          leafletMap.current?.removeLayer(layer);
        }
      });
      

      const marker = L.marker([latitude, longitude]).addTo(leafletMap.current);
      
    
      if (address) {
        marker.bindPopup(address).openPopup();
      }
    }
  }, [latitude, longitude, address, zoom]);
  
  return (
    <div className="map-view-container" style={{ height }}>
      <div ref={mapRef} className="map-view"></div>
    </div>
  );
};

export default MapView;