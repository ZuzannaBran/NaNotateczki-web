export type Platform = 'windows' | 'linux' | 'android' | 'macos' | 'ios';

export interface DownloadConfig {
  readonly webAppUrl: string;
  readonly downloads: Readonly<Record<Platform, string>>;
}

/** Leave releases unavailable until their official URLs are published. */
export const config: DownloadConfig = {
  webAppUrl: '',
  downloads: { windows: '', linux: '', android: '', macos: '', ios: '' },
};
