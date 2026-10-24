export interface KannadaNumberResult {
  value: number;
  digitsEn: string;
  digitsKn: string;
  kannadaWords: string;
  transliteration: string;
  currencyKn: string;
  currencyTranslit: string;
}

export interface PresetAmount {
  label: string;
  amount: number;
  category: 'auto' | 'grocery' | 'common';
  description: string;
}

export interface PaymentPhrase {
  id: string;
  english: string;
  kannada: string;
  transliteration: string;
  category: 'auto' | 'market' | 'online';
}

const ONES: Record<number, { kn: string; tr: string }> = {
  0: { kn: 'ಸೊನ್ನೆ', tr: 'Sonne' },
  1: { kn: 'ಒಂದು', tr: 'Ondu' },
  2: { kn: 'ಎರಡು', tr: 'Eradu' },
  3: { kn: 'ಮೂರು', tr: 'Mooru' },
  4: { kn: 'ನಾಲ್ಕು', tr: 'Naalku' },
  5: { kn: 'ಐದು', tr: 'Aidu' },
  6: { kn: 'ಆರು', tr: 'Aaru' },
  7: { kn: 'ಏಳು', tr: 'Eelu' },
  8: { kn: 'ಎಂಟು', tr: 'Entu' },
  9: { kn: 'ಒಂಬತ್ತು', tr: 'Ombattu' },
};

const TEENS: Record<number, { kn: string; tr: string }> = {
  10: { kn: 'ಹತ್ತು', tr: 'Hattu' },
  11: { kn: 'ಹನ್ನೊಂದು', tr: 'Hannondu' },
  12: { kn: 'ಹನ್ನೆರಡು', tr: 'Hanneradu' },
  13: { kn: 'ಹದಿಮೂರು', tr: 'Hadimooru' },
  14: { kn: 'ಹದಿನಾಲ್ಕು', tr: 'Hadinaalku' },
  15: { kn: 'ಹದಿನೈದು', tr: 'Hadinaidu' },
  16: { kn: 'ಹದಿನಾರು', tr: 'Hadinaaru' },
  17: { kn: 'ಹದಿನೇಳು', tr: 'Hadineelu' },
  18: { kn: 'ಹದಿನೆಂಟು', tr: 'Hadinentu' },
  19: { kn: 'ಹತ್ತೊಂಬತ್ತು', tr: 'Hattombattu' },
};

const TENS_BASE: Record<number, { knPrefix: string; trPrefix: string; exactKn: string; exactTr: string }> = {
  20: { knPrefix: 'ಇಪ್ಪತ್ತ', trPrefix: 'Ippatta', exactKn: 'ಇಪ್ಪತ್ತು', exactTr: 'Ippattu' },
  30: { knPrefix: 'ಮೂವತ್ತ', trPrefix: 'Moovatta', exactKn: 'ಮೂವತ್ತು', exactTr: 'Moovattu' },
  40: { knPrefix: 'ನಲವತ್ತ', trPrefix: 'Nalavatta', exactKn: 'ನಲವತ್ತು', exactTr: 'Nalavattu' },
  50: { knPrefix: 'ಐವತ್ತ', trPrefix: 'Aivatta', exactKn: 'ಐವತ್ತು', exactTr: 'Aivattu' },
  60: { knPrefix: 'ಅರವತ್ತ', trPrefix: 'Aravatta', exactKn: 'ಅರವತ್ತು', exactTr: 'Aravattu' },
  70: { knPrefix: 'ಎಪ್ಪತ್ತ', trPrefix: 'Eppatta', exactKn: 'ಎಪ್ಪತ್ತು', exactTr: 'Eppattu' },
  80: { knPrefix: 'ಎಂಬತ್ತ', trPrefix: 'Embatta', exactKn: 'ಎಂಬತ್ತು', exactTr: 'Embattu' },
  90: { knPrefix: 'ತೊಂಬತ್ತ', trPrefix: 'Tombatta', exactKn: 'ತೊಂಬತ್ತು', exactTr: 'Tombattu' },
};

const HUNDREDS: Record<number, { exactKn: string; exactTr: string; prefixKn: string; prefixTr: string }> = {
  100: { exactKn: 'ನೂರು', exactTr: 'Nooru', prefixKn: 'ನೂರ', prefixTr: 'Noora' },
  200: { exactKn: 'ಇನ್ನೂರು', exactTr: 'Innooru', prefixKn: 'ಇನ್ನೂರ', prefixTr: 'Innoora' },
  300: { exactKn: 'ಮುನ್ನೂರು', exactTr: 'Munnooru', prefixKn: 'ಮುನ್ನೂರ', prefixTr: 'Munnoora' },
  400: { exactKn: 'ನಾನೂರು', exactTr: 'Naanooru', prefixKn: 'ನಾನೂರಾ', prefixTr: 'Naanoora' },
  500: { exactKn: 'ಐನೂರು', exactTr: 'Ainooru', prefixKn: 'ಐನೂರ', prefixTr: 'Ainoora' },
  600: { exactKn: 'ಆರುನೂರು', exactTr: 'Aarunooru', prefixKn: 'ಆರುನೂರ', prefixTr: 'Aarunoora' },
  700: { exactKn: 'ಏಳುನೂರು', exactTr: 'Eelunooru', prefixKn: 'ಏಳುನೂರ', prefixTr: 'Eelunoora' },
  800: { exactKn: 'ಎಂಟುನೂರು', exactTr: 'Entunooru', prefixKn: 'ಎಂಟುನೂರ', prefixTr: 'Entunoora' },
  900: { exactKn: 'ಒಂಬೈನೂರು', exactTr: 'Ombainooru', prefixKn: 'ಒಂಬೈನೂರ', prefixTr: 'Ombainoora' },
};

const KN_DIGITS = ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'];

export function toKannadaDigits(num: number | string): string {
  return String(num)
    .split('')
    .map(c => {
      const idx = parseInt(c, 10);
      return isNaN(idx) ? c : KN_DIGITS[idx];
    })
    .join('');
}

function convertUnder100(n: number): { kn: string; tr: string } {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n];

  const tens = Math.floor(n / 10) * 10;
  const rem = n % 10;
  const config = TENS_BASE[tens];
  if (!config) return { kn: String(n), tr: String(n) };

  if (rem === 0) {
    return { kn: config.exactKn, tr: config.exactTr };
  }

  const one = ONES[rem];
  // Sandhi rule: ಇಪ್ಪತ್ತ + ಒಂದು = ಇಪ್ಪತ್ತೊಂದು
  return {
    kn: config.knPrefix + one.kn,
    tr: config.trPrefix + ' ' + one.tr.toLowerCase(),
  };
}

export function convertNumberToKannada(n: number): KannadaNumberResult {
  const value = Math.max(0, Math.min(99999, Math.floor(n)));
  const digitsEn = String(value);
  const digitsKn = toKannadaDigits(value);

  if (value === 0) {
    return {
      value: 0,
      digitsEn: '0',
      digitsKn: '೦',
      kannadaWords: 'ಸೊನ್ನೆ',
      transliteration: 'Sonne',
      currencyKn: 'ಸೊನ್ನೆ ರೂಪಾಯಿ',
      currencyTranslit: 'Sonne roopayi',
    };
  }

  let knParts: string[] = [];
  let trParts: string[] = [];

  let remaining = value;

  // Thousands (1000 - 99000)
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    remaining = remaining % 1000;
    const thousandsResult = convertUnder100(thousands);

    knParts.push(`${thousandsResult.kn} ಸಾವಿರ`);
    trParts.push(`${thousandsResult.tr} saavira`);
  }

  // Hundreds (100 - 900)
  if (remaining >= 100) {
    const hundredDigit = Math.floor(remaining / 100) * 100;
    remaining = remaining % 100;
    const hConfig = HUNDREDS[hundredDigit];

    if (hConfig) {
      if (remaining === 0) {
        knParts.push(hConfig.exactKn);
        trParts.push(hConfig.exactTr);
      } else {
        knParts.push(hConfig.prefixKn);
        trParts.push(hConfig.prefixTr);
      }
    }
  }

  // Remaining 1 - 99
  if (remaining > 0) {
    const under100 = convertUnder100(remaining);
    knParts.push(under100.kn);
    trParts.push(under100.tr);
  }

  const kannadaWords = knParts.join(' ');
  const transliteration = trParts.join(' ');

  return {
    value,
    digitsEn,
    digitsKn,
    kannadaWords,
    transliteration,
    currencyKn: `${kannadaWords} ರೂಪಾಯಿ`,
    currencyTranslit: `${transliteration} roopayi`,
  };
}

export const PRESET_AMOUNTS: PresetAmount[] = [
  { label: '₹30 (Min. Meter)', amount: 30, category: 'auto', description: 'Bengaluru minimum auto fare' },
  { label: '₹50', amount: 50, category: 'auto', description: 'Short auto trip / snacks' },
  { label: '₹70', amount: 70, category: 'auto', description: 'Average 3-4 km ride' },
  { label: '₹100', amount: 100, category: 'common', description: 'Standard currency note' },
  { label: '₹150', amount: 150, category: 'auto', description: 'Medium distance ride' },
  { label: '₹200', amount: 200, category: 'common', description: 'Grocery / auto fare' },
  { label: '₹500', amount: 500, category: 'common', description: 'High value currency note' },
];

export const PAYMENT_PHRASES: PaymentPhrase[] = [
  {
    id: 'pay-1',
    english: 'How much is the fare?',
    kannada: 'ಎಷ್ಟು ಆಯ್ತು?',
    transliteration: 'Eshtu aithu?',
    category: 'auto',
  },
  {
    id: 'pay-2',
    english: 'Please put the meter',
    kannada: 'ಮೀಟರ್ ಹಾಕಿ, ಪ್ಲೀಸ್',
    transliteration: 'Meter haaki, please',
    category: 'auto',
  },
  {
    id: 'pay-3',
    english: 'Do you have change for 500?',
    kannada: 'ಐನೂರಕ್ಕೆ ಚಿಲ್ಲರೆ ಇದ್ಯಾ?',
    transliteration: 'Ainoorakke chillare idhya?',
    category: 'market',
  },
  {
    id: 'pay-4',
    english: 'Do you have change for 100?',
    kannada: 'ನೂರಕ್ಕೆ ಚಿಲ್ಲರೆ ಇದ್ಯಾ?',
    transliteration: 'Noorakke chillare idhya?',
    category: 'market',
  },
  {
    id: 'pay-5',
    english: 'I will scan QR code and pay',
    kannada: 'ಸ್ಕಾನರ್ ಇದ್ಯಾ? ಯುಪಿಐ ಮಾಡ್ತೀನಿ',
    transliteration: 'Scanner idhya? UPI maadtini',
    category: 'online',
  },
  {
    id: 'pay-6',
    english: 'Take fifty rupees',
    kannada: 'ಐವತ್ತು ರೂಪಾಯಿ ತಗೊಳ್ಳಿ',
    transliteration: 'Aivattu roopayi thegolli',
    category: 'market',
  },
  {
    id: 'pay-7',
    english: 'Reduce twenty rupees please',
    kannada: 'ಇಪ್ಪತ್ತು ರೂಪಾಯಿ ಕಮ್ಮಿ ಮಾಡಿ',
    transliteration: 'Ippattu roopayi kammi maadi',
    category: 'market',
  },
  {
    id: 'pay-8',
    english: 'Keep the change',
    kannada: 'ಚಿಲ್ಲರೆ ನೀವೇ ಇಟ್ಕೊಳ್ಳಿ',
    transliteration: 'Chillare neeve itkolli',
    category: 'auto',
  },
];

export const CHEATSHEET_NUMBERS = [
  { val: 1, kn: 'ಒಂದು', tr: 'Ondu', knDigit: '೧' },
  { val: 2, kn: 'ಎರಡು', tr: 'Eradu', knDigit: '೨' },
  { val: 3, kn: 'ಮೂರು', tr: 'Mooru', knDigit: '೩' },
  { val: 4, kn: 'ನಾಲ್ಕು', tr: 'Naalku', knDigit: '೪' },
  { val: 5, kn: 'ಐದು', tr: 'Aidu', knDigit: '೫' },
  { val: 6, kn: 'ಆರು', tr: 'Aaru', knDigit: '೬' },
  { val: 7, kn: 'ಏಳು', tr: 'Eelu', knDigit: '೭' },
  { val: 8, kn: 'ಎಂಟು', tr: 'Entu', knDigit: '೮' },
  { val: 9, kn: 'ಒಂಬತ್ತು', tr: 'Ombattu', knDigit: '೯' },
  { val: 10, kn: 'ಹತ್ತು', tr: 'Hattu', knDigit: '೧೦' },
  { val: 20, kn: 'ಇಪ್ಪತ್ತು', tr: 'Ippattu', knDigit: '೨೦' },
  { val: 30, kn: 'ಮೂವತ್ತು', tr: 'Moovattu', knDigit: '೩೦' },
  { val: 40, kn: 'ನಲವತ್ತು', tr: 'Nalavattu', knDigit: '೪೦' },
  { val: 50, kn: 'ಐವತ್ತು', tr: 'Aivattu', knDigit: '೫೦' },
  { val: 60, kn: 'ಅರವತ್ತು', tr: 'Aravattu', knDigit: '೬೦' },
  { val: 70, kn: 'ಎಪ್ಪತ್ತು', tr: 'Eppattu', knDigit: '೭೦' },
  { val: 80, kn: 'ಎಂಬತ್ತು', tr: 'Embattu', knDigit: '೮೦' },
  { val: 90, kn: 'ತೊಂಬತ್ತು', tr: 'Tombattu', knDigit: '೯೦' },
  { val: 100, kn: 'ನೂರು', tr: 'Nooru', knDigit: '೧೦೦' },
  { val: 500, kn: 'ಐನೂರು', tr: 'Ainooru', knDigit: '೫೦೦' },
  { val: 1000, kn: 'ಒಂದು ಸಾವಿರ', tr: 'Ondu saavira', knDigit: '೧೦೦೦' },
];
