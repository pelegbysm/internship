import React from 'react';
import { IonModal } from '@ionic/react';
import LocationPicker from './LocationPicker';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number; address: string };
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <LocationPicker
        onDismiss={onClose}
        onLocationSelect={(location) => {
          onLocationSelect(location);
          onClose();
        }}
        initialLocation={initialLocation}
      />
    </IonModal>
  );
};

export default LocationModal;