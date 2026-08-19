export type AppMode = 'demo' | 'private' | 'disabled';

export const APP_MODE: Readonly<{
  DEMO: 'demo';
  PRIVATE: 'private';
  DISABLED: 'disabled';
}>;

export function getAppMode(value?: string): AppMode;
export function canUsePrivateApi(value?: string): boolean;
