// Bu listeler, dünya genelinde daha fazla kullanıcıyı kapsayacak şekilde genişletildi.
export const countryOptions = [
  // Asia
  { value: 'CN', label: '🇨🇳 China', continents: ['AS'] },
  { value: 'IN', label: '🇮🇳 India', continents: ['AS'] },
  { value: 'ID', label: '🇮🇩 Indonesia', continents: ['AS'] },
  { value: 'PK', label: '🇵🇰 Pakistan', continents: ['AS'] },
  { value: 'BD', label: '🇧🇩 Bangladesh', continents: ['AS'] },
  { value: 'JP', label: '🇯🇵 Japan', continents: ['AS'] },
  { value: 'PH', label: '🇵🇭 Philippines', continents: ['AS'] },
  { value: 'VN', label: '🇻🇳 Vietnam', continents: ['AS'] },
  { value: 'IR', label: '🇮🇷 Iran', continents: ['AS'] },
  { value: 'TH', label: '🇹🇭 Thailand', continents: ['AS'] },
  { value: 'KR', label: '🇰🇷 South Korea', continents: ['AS'] },
  { value: 'SA', label: '🇸🇦 Saudi Arabia', continents: ['AS'] },
  { value: 'AE', label: '🇦🇪 United Arab Emirates', continents: ['AS'] },

  // Europe
  { value: 'DE', label: '🇩🇪 Germany', continents: ['EU'] },
  { value: 'GB', label: '🇬🇧 United Kingdom', continents: ['EU'] },
  { value: 'FR', label: '🇫🇷 France', continents: ['EU'] },
  { value: 'IT', label: '🇮🇹 Italy', continents: ['EU'] },
  { value: 'ES', label: '🇪🇸 Spain', continents: ['EU'] },
  { value: 'UA', label: '🇺🇦 Ukraine', continents: ['EU'] },
  { value: 'PL', label: '🇵🇱 Poland', continents: ['EU'] },
  { value: 'RO', label: '🇷🇴 Romania', continents: ['EU'] },
  { value: 'NL', label: '🇳🇱 Netherlands', continents: ['EU'] },
  { value: 'BE', label: '🇧🇪 Belgium', continents: ['EU'] },
  { value: 'GR', label: '🇬🇷 Greece', continents: ['EU'] },
  { value: 'PT', label: '🇵🇹 Portugal', continents: ['EU'] },
  { value: 'SE', label: '🇸🇪 Sweden', continents: ['EU'] },
  { value: 'HU', label: '🇭🇺 Hungary', continents: ['EU'] },
  { value: 'CH', label: '🇨🇭 Switzerland', continents: ['EU'] },
  { value: 'AT', label: '🇦🇹 Austria', continents: ['EU'] },
  { value: 'NO', label: '🇳🇴 Norway', continents: ['EU'] },
  { value: 'IE', label: '🇮🇪 Ireland', continents: ['EU'] },

  // North America
  { value: 'US', label: '🇺🇸 United States', continents: ['NA'] },
  { value: 'MX', label: '🇲🇽 Mexico', continents: ['NA'] },
  { value: 'CA', label: '🇨🇦 Canada', continents: ['NA'] },

  // South America
  { value: 'BR', label: '🇧🇷 Brazil', continents: ['SA'] },
  { value: 'CO', label: '🇨🇴 Colombia', continents: ['SA'] },
  { value: 'AR', label: '🇦🇷 Argentina', continents: ['SA'] },
  { value: 'PE', label: '🇵🇪 Peru', continents: ['SA'] },
  { value: 'VE', label: '🇻🇪 Venezuela', continents: ['SA'] },
  { value: 'CL', label: '🇨🇱 Chile', continents: ['SA'] },

  // Africa
  { value: 'NG', label: '🇳🇬 Nigeria', continents: ['AF'] },
  { value: 'ET', label: '🇪🇹 Ethiopia', continents: ['AF'] },
  { value: 'CD', label: '🇨🇩 Congo', continents: ['AF'] },
  { value: 'ZA', label: '🇿🇦 South Africa', continents: ['AF'] },
  { value: 'TZ', label: '🇹🇿 Tanzania', continents: ['AF'] },
  { value: 'KE', label: '🇰🇪 Kenya', continents: ['AF'] },
  { value: 'DZ', label: '🇩🇿 Algeria', continents: ['AF'] },
  { value: 'MA', label: '🇲🇦 Morocco', continents: ['AF'] },

  // Oceania
  { value: 'AU', label: '🇦🇺 Australia', continents: ['OC'] },
  { value: 'NZ', label: '🇳🇿 New Zealand', continents: ['OC'] },
  
  // Transcontinental
  { value: 'RU', label: '🇷🇺 Russia', continents: ['AS', 'EU'] },
  { value: 'TR', label: '🇹🇷 Turkey', continents: ['AS', 'EU'] },
  { value: 'EG', label: '🇪🇬 Egypt', continents: ['AF', 'AS']},
];

export const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Mandarin Chinese', label: 'Mandarin Chinese' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'Standard Arabic', label: 'Standard Arabic' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Persian (Farsi)', label: 'Persian (Farsi)' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Czech', label: 'Czech' },
];

export const continentOptions = [
    { value: 'AF', label: 'Africa' },
    { value: 'AS', label: 'Asia' },
    { value: 'EU', label: 'Europe' },
    { value: 'NA', label: 'North America' },
    { value: 'SA', label: 'South America' },
    { value: 'OC', label: 'Oceania' },
];