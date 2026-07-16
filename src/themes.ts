export interface Theme {
  titleColor: string;
  iconColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

const defaultTheme: Theme = {
  titleColor: '2f80ed',
  iconColor: '4c71f2',
  textColor: '434d58',
  bgColor: 'fffefe',
  borderColor: 'e4e2e2',
};

export const themes: Record<string, Theme> = {
  default: defaultTheme,
  dracula: {
    titleColor: 'ff6e96',
    iconColor: '79dafa',
    textColor: 'f8f8f2',
    bgColor: '282a36',
    borderColor: 'e4e2e2',
  },
};

export function getTheme(name?: string): Theme {
  if (!name) return defaultTheme;
  return themes[name] ?? defaultTheme;
}
