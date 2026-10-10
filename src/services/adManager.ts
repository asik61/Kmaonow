// =========================================================================
// Real Money App — AdMob Ads Manager (APK-Only Architecture)
// Ads are only loaded and displayed for APK users, NOT website/PWA users.
// =========================================================================

export interface AdManagerInterface {
  showRewardedAd: (onRewardCallback: () => void) => void;
  showInterstitialAd: () => void;
  showBannerAd: () => void;
  isAPK: boolean;
}

declare global {
  interface Window {
    adManager?: AdManagerInterface;
  }
}

// APK Detection
export const isAPK = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    navigator.userAgent.includes('RealMoneyApp') ||
    new URLSearchParams(window.location.search).get('source') === 'apk'
  );
};

// Placeholder Ad Unit IDs — Replace with real IDs after AdMob approval in admob.google.com
export const AD_UNITS = {
  rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Extra Spin / Scratch unlock
  interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // After task submission
  banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Bottom of Home page
};

// Rewarded Ad — call before extra spin or scratch reward
export function showRewardedAd(onRewardCallback: () => void): void {
  if (!isAPK()) {
    onRewardCallback();
    return;
  }
  console.log('[AdMob] Rewarded ad placeholder — Ad Unit ID:', AD_UNITS.rewarded);
  // Directly reward user until native AdMob SDK is connected
  onRewardCallback();
}

// Interstitial Ad — call after task proof is submitted
export function showInterstitialAd(): void {
  if (!isAPK()) return;
  console.log('[AdMob] Interstitial ad placeholder — Ad Unit ID:', AD_UNITS.interstitial);
}

// Banner Ad — call on Home page load
export function showBannerAd(): void {
  if (!isAPK()) return;
  console.log('[AdMob] Banner ad placeholder — Ad Unit ID:', AD_UNITS.banner);
}

// Initialize on window for global access
if (typeof window !== 'undefined') {
  window.adManager = {
    showRewardedAd,
    showInterstitialAd,
    showBannerAd,
    isAPK: isAPK(),
  };
}
