export const APP_MODE = Object.freeze({
  DEMO: 'demo',
  PRIVATE: 'private',
  DISABLED: 'disabled',
});

export function getAppMode(value = process.env.APP_MODE) {
  if (value === APP_MODE.DEMO || value === APP_MODE.PRIVATE) {
    return value;
  }

  return APP_MODE.DISABLED;
}

export function canUsePrivateApi(value = process.env.APP_MODE) {
  return getAppMode(value) === APP_MODE.PRIVATE;
}
