import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';

export interface EmergencyPhrase {
  id: string;
  category: string;
  kannada: string;
  transliteration: string;
  english: string;
  audioKey?: string;
}

export interface EmergencyCategory {
  id: string;
  label: string;
  labelKannada: string;
  icon: string;
  color: string;
  phrases: EmergencyPhrase[];
}

export const EMERGENCY_DATA: EmergencyCategory[] = [
  {
    id: 'police',
    label: 'Police',
    labelKannada: 'ಪೊಲೀಸ್',
    icon: 'police',
    color: '#064E3B',
    phrases: [
      { id: 'pol-1', category: 'police', kannada: 'ಪೊಲೀಸ್ ಸಹಾಯ ಬೇಕು', transliteration: 'Polees sahaya beku', english: 'I need police help' },
      { id: 'pol-2', category: 'police', kannada: 'ನನಗೆ ಕಳ್ಳತನ ಆಯಿತು', transliteration: 'Nanage kaltana aayitu', english: 'I have been robbed' },
      { id: 'pol-3', category: 'police', kannada: 'ದಯವಿಟ್ಟು ಠಾಣೆಗೆ ಕರೆದುಕೊಂಡು ಹೋಗಿ', transliteration: 'Dayavittu thaanege karedukondu hoogi', english: 'Please take me to the police station' },
      { id: 'pol-4', category: 'police', kannada: '100 ಗೆ ಕರೆ ಮಾಡಿ', transliteration: '100 ge kare maadi', english: 'Call 100 (Police emergency)' },
    ],
  },
  {
    id: 'hospital',
    label: 'Hospital',
    labelKannada: 'ಆಸ್ಪತ್ರೆ',
    icon: 'hospital',
    color: '#2563EB',
    phrases: [
      { id: 'hos-1', category: 'hospital', kannada: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆ ಮಾಡಿ', transliteration: 'Ambulance kare maadi', english: 'Call an ambulance' },
      { id: 'hos-2', category: 'hospital', kannada: 'ನನಗೆ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಬೇಕು', transliteration: 'Nanage aaspatrege hoogabeeku', english: 'I need to go to the hospital' },
      { id: 'hos-3', category: 'hospital', kannada: 'ನಾನು ಅನಾರೋಗ್ಯದಿಂದ ಇದ್ದೇನೆ', transliteration: 'Naanu anaarogyaginda iddene', english: 'I am feeling sick' },
      { id: 'hos-4', category: 'hospital', kannada: '108 ಗೆ ಕರೆ ಮಾಡಿ', transliteration: '108 ge kare maadi', english: 'Call 108 (Ambulance emergency)' },
      { id: 'hos-5', category: 'hospital', kannada: 'ನನಗೆ ನೋವು ಇದೆ', transliteration: 'Nanage novu ide', english: 'I am in pain' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    labelKannada: 'ಸಹಾಯ ಬೇಕು',
    icon: 'help',
    color: '#0D9488',
    phrases: [
      { id: 'hlp-1', category: 'help', kannada: 'ಸಹಾಯ ಮಾಡಿ!', transliteration: 'Sahaya maadi!', english: 'Help me!' },
      { id: 'hlp-2', category: 'help', kannada: 'ನಾನು ದಾರಿ ತಪ್ಪಿದ್ದೇನೆ', transliteration: 'Naanu daari tappiddene', english: 'I am lost' },
      { id: 'hlp-3', category: 'help', kannada: 'ಇಂಗ್ಲಿಷ್ ಮಾತನಾಡುವ ಯಾರಾದರೂ ಇದ್ದಾರೆಯೇ?', transliteration: 'English maatanaaduvara yaaradaroo iddaareye?', english: 'Is there anyone who speaks English?' },
      { id: 'hlp-4', category: 'help', kannada: 'ದಯವಿಟ್ಟು ನನ್ನ ರಾಯಭಾರ ಕಚೇರಿಗೆ ಕರೆ ಮಾಡಿ', transliteration: 'Dayavittu nanna raayabhaara kacheerige kare maadi', english: 'Please call my embassy' },
      { id: 'hlp-5', category: 'help', kannada: 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ', transliteration: 'Dayavittu nidaanavaagi maatanaadi', english: 'Please speak slowly' },
    ],
  },
  {
    id: 'fire',
    label: 'Fire',
    labelKannada: 'ಅಗ್ನಿಶಾಮಕ ದಳ',
    icon: 'fire',
    color: '#DC2626',
    phrases: [
      { id: 'fir-1', category: 'fire', kannada: 'ಬೆಂಕಿ ಹಿಡಿದಿದೆ', transliteration: 'Benki hidididhe', english: 'There is a fire' },
      { id: 'fir-2', category: 'fire', kannada: 'ಅಗ್ನಿಶಾಮಕ ದಳಕ್ಕೆ ಕರೆ ಮಾಡಿ', transliteration: 'Agnishamaka dalakke kare maadi', english: 'Call the fire brigade' },
      { id: 'fir-3', category: 'fire', kannada: '101 ಗೆ ಕರೆ ಮಾಡಿ', transliteration: '101 ge kare maadi', english: 'Call 101 (Fire emergency)' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class EmergencyKitService {
  private readonly STORAGE_KEY = 'ks_emergency_offline';

  constructor(private storage: StorageService) {
    if (!this.storage.get(this.STORAGE_KEY, null)) {
      this.storage.set(this.STORAGE_KEY, true);
    }
  }

  isOfflineModeEnabled(): boolean {
    return this.storage.get<boolean>(this.STORAGE_KEY, true);
  }

  setOfflineModeEnabled(enabled: boolean): void {
    this.storage.set(this.STORAGE_KEY, enabled);
  }

  getCategories(): EmergencyCategory[] {
    return EMERGENCY_DATA;
  }

  getCategoryById(id: string): EmergencyCategory | undefined {
    return EMERGENCY_DATA.find(c => c.id === id);
  }
}
