import React, { useEffect, useRef, useState } from 'react';
import { 
  IonButton, 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonIcon, 
  IonLoading,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
  IonToast
} from '@ionic/react';
import { closeOutline, locateOutline, searchOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

interface LocationPickerProps {
  onDismiss: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number; address: string };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onDismiss, 
  onLocationSelect,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(initialLocation || null);
  
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      const defaultLocation: L.LatLngExpression = initialLocation 
        ? [initialLocation.latitude, initialLocation.longitude] 
        : [32.0853, 34.7818];
      
      leafletMap.current = L.map(mapRef.current).setView(defaultLocation, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      
      if (initialLocation) {
        marker.current = L.marker(defaultLocation).addTo(leafletMap.current);
      }
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [initialLocation]);
  
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.on('click', handleMapClick);
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.off('click', handleMapClick);
      }
    };
  }, []);
  
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    
    try {
      if (marker.current && leafletMap.current) {
        leafletMap.current.removeLayer(marker.current);
      }
      
      if (leafletMap.current) {
        marker.current = L.marker([lat, lng]).addTo(leafletMap.current);
      }
      
      const addressText = await reverseGeocode(lat, lng);
      setAddress(addressText);
      
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: addressText
      });
    } catch (err) {
      setErrorMessage('שגיאה בקבלת פרטי המיקום');
      setShowError(true);
    }
  };
  
  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      if (leafletMap.current) {
        leafletMap.current.setView([latitude, longitude], 15);
        
        if (marker.current) {
          leafletMap.current.removeLayer(marker.current);
        }
        
        marker.current = L.marker([latitude, longitude]).addTo(leafletMap.current);
      }
      
      const addressText = await reverseGeocode(latitude, longitude);
      setAddress(addressText);
      
      setSelectedLocation({
        latitude,
        longitude,
        address: addressText
      });
    } catch (err) {
      setErrorMessage('לא הצלחנו לאתר את המיקום שלך. ודא שאישרת גישה למיקום.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const searchAddress = async () => {
    if (!address.trim()) return;
    
    try {
      setLoading(true);
      
      const coordinates = await geocodeAddress(address);
      
      if (!coordinates) {
        setErrorMessage('לא הצלחנו למצוא את הכתובת. נסה שנית עם כתובת מדויקת יותר.');
        setShowError(true);
        return;
      }
      
      const { lat, lng } = coordinates;
      
      if (leafletMap.current) {
        leafletMap.current.setView([lat, lng], 15);
        
        if (marker.current) {
          leafletMap.current.removeLayer(marker.current);
        }
        
        marker.current = L.marker([lat, lng]).addTo(leafletMap.current);
      }
      
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address
      });
    } catch (err) {
      setErrorMessage('שגיאה בחיפוש הכתובת');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };
  
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('שגיאה בקבלת פרטי כתובת');
      }
      
      const data = await response.json();
      return data.display_name || 'כתובת לא ידועה';
    } catch (err) {
      console.error('שגיאה בהמרת קואורדינטות לכתובת:', err);
      return 'כתובת לא ידועה';
    }
  };
  
  const geocodeAddress = async (searchAddress: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const encodedAddress = encodeURIComponent(searchAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('שגיאה בחיפוש כתובת');
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } catch (err) {
      console.error('שגיאה בהמרת כתובת לקואורדינטות:', err);
      return null;
    }
  };
  
  const confirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };
  
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>בחר מיקום</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div className="search-container">
          <IonItem>
            <IonLabel position="floating">חפש כתובת</IonLabel>
            <IonInput
              value={address}
              onIonChange={e => setAddress(e.detail.value || '')}
              placeholder="הזן כתובת לחיפוש"
            />
            <IonButton slot="end" fill="clear" onClick={searchAddress}>
              <IonIcon icon={searchOutline} />
            </IonButton>
          </IonItem>
        </div>
        
        <div className="map-container">
          <div ref={mapRef} className="map-element"></div>
          
          <IonButton 
            className="locate-button" 
            fill="solid" 
            shape="round" 
            color="primary"
            onClick={getCurrentLocation}
          >
            <IonIcon icon={locateOutline} />
          </IonButton>
        </div>
        
        <div className="location-info">
          {selectedLocation && (
            <p className="selected-address">{selectedLocation.address}</p>
          )}
        </div>
      </IonContent>
      
      <IonFooter>
        <IonToolbar>
          <IonButton 
            expand="block" 
            onClick={confirmLocation} 
            disabled={!selectedLocation}
          >
            אישור מיקום
          </IonButton>
        </IonToolbar>
      </IonFooter>
      
      <IonLoading
        isOpen={loading}
        message="טוען..."
      />
      
      <IonToast
        isOpen={showError}
        onDidDismiss={() => setShowError(false)}
        message={errorMessage}
        duration={3000}
        color="danger"
      />
    </>
  );
};

export default LocationPicker;