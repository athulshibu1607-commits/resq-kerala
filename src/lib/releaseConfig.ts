export interface AppReleaseMetadata {
  appName: string;
  appId: string;
  version: string;
  versionCode: number;
  buildDate: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  minSdkVersion: number;
  minSdkName: string;
  targetSdkVersion: number;
  targetSdkName: string;
  apkDownloadPath: string;
  apkDirectPath: string;
  debugApkPath: string;
  isPublished: boolean;
  sha256Checksum?: string;
  permissions: string[];
  publicDownloadUrl: string;
  publicReleasePageUrl: string;
  publicRepoUrl: string;
}

export const CURRENT_APP_RELEASE: AppReleaseMetadata = {
  appName: 'RESQ KERALA',
  appId: 'in.resqkerala.app',
  version: '1.0.0',
  versionCode: 1,
  buildDate: '2026-10-31',
  fileSizeBytes: 3412537,
  fileSizeFormatted: '3.3 MB',
  minSdkVersion: 24,
  minSdkName: 'Android 7.0 (Nougat) or newer',
  targetSdkVersion: 34,
  targetSdkName: 'Android 14 (UpsideDownCake)',
  apkDownloadPath: '/downloads/resq-kerala-v1.0.0.apk',
  apkDirectPath: '/resq-kerala.apk',
  debugApkPath: '/downloads/resq-kerala-v1.0.0-debug.apk',
  isPublished: true,
  sha256Checksum: '2c07ff86d8aef41d892d11de74da56898442d14ad1d18f54d816e5e34c581f72',
  publicDownloadUrl: 'https://github.com/athulshibu1607-commits/resq-kerala/releases/download/v1.0.0/resq-kerala-v1.0.0.apk',
  publicReleasePageUrl: 'https://github.com/athulshibu1607-commits/resq-kerala/releases/tag/v1.0.0',
  publicRepoUrl: 'https://github.com/athulshibu1607-commits/resq-kerala',
  permissions: [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.VIBRATE',
  ],
};
