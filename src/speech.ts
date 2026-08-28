export type SpeechPath = 'android-offline' | 'web-offline' | 'unavailable';

export function chooseSpeechPath(nativeAndroid: boolean, webLocalRecognition: boolean): SpeechPath {
  if (nativeAndroid) return 'android-offline';
  if (webLocalRecognition) return 'web-offline';
  return 'unavailable';
}
