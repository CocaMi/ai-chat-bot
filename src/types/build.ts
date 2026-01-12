/**
 * Build mode configuration types
 */
export type BuildMode = 'APP' | 'PACKAGE';

/**
 * Build configuration interface
 */
export interface BuildConfig {
  mode: BuildMode;
  isApp: boolean;
  isPackage: boolean;
}

/**
 * Get build configuration from environment
 */
export function getBuildConfig(): BuildConfig {
  const mode = (import.meta.env.VITE_BUILD_MODE || 'APP') as BuildMode;
  
  return {
    mode,
    isApp: mode === 'APP',
    isPackage: mode === 'PACKAGE',
  };
}
