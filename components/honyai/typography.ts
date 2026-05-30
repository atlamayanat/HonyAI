// Mulish weight → fontFamily eşlemesi. App.tsx'te yüklenen weight'ler.
export const mulish = {
  400: 'Mulish_400Regular',
  500: 'Mulish_500Medium',
  600: 'Mulish_600SemiBold',
  700: 'Mulish_700Bold',
  800: 'Mulish_800ExtraBold',
} as const;

export const newsreader = {
  500: 'Newsreader_500Medium',
  700: 'Newsreader_700Bold',
} as const;

export type MulishWeight = keyof typeof mulish;
export type NewsreaderWeight = keyof typeof newsreader;
