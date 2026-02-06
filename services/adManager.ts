import { useAdStore } from "@/src/store/adStore";
import { AD_CONFIG } from "@/src/utils/constants";
import { Platform } from "react-native";
import { MaxAdContentRating } from "react-native-google-mobile-ads";

// ==========================================
// CHECK IF ADMOB IS AVAILABLE
// ==========================================

let isAdMobAvailable = false;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;

try {
  const admob = require("react-native-google-mobile-ads");
  InterstitialAd = admob.InterstitialAd;
  RewardedAd = admob.RewardedAd;
  AdEventType = admob.AdEventType;
  RewardedAdEventType = admob.RewardedAdEventType;
  TestIds = admob.TestIds;
  isAdMobAvailable = true;
  console.log("📺 AdMob module loaded");
} catch (error) {
  console.log("📺 AdMob not available (Expo Go or not configured)");
  isAdMobAvailable = false;
}

// ==========================================
// AD UNIT IDS
// ==========================================

const getInterstitialId = () => {
  if (__DEV__ && TestIds) return TestIds.INTERSTITIAL;
  return Platform.OS === "ios"
    ? AD_CONFIG.interstitial.ios
    : AD_CONFIG.interstitial.android;
};

// ==========================================
// AD INSTANCES
// ==========================================

let interstitialAd: any = null;
let rewardedAd: any = null;
let isInterstitialLoaded = false;
let isRewardedLoaded = false;

// ==========================================
// INTERSTITIAL ADS
// ==========================================

export const loadInterstitial = () => {
  if (!isAdMobAvailable || !InterstitialAd) {
    console.log("📺 AdMob not available, skipping interstitial load");
    return;
  }

  try {
    interstitialAd = InterstitialAd.createForAdRequest(getInterstitialId());

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
      useAdStore.getState().actions.setInterstitialReady(true);
      console.log("📺 Interstitial loaded");
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      useAdStore.getState().actions.setInterstitialReady(false);
      loadInterstitial(); // Preload next
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
      console.log("📺 Interstitial error:", error);
      isInterstitialLoaded = false;
      useAdStore.getState().actions.setInterstitialReady(false);
    });

    interstitialAd.load();
  } catch (error) {
    console.log("📺 Interstitial init error:", error);
  }
};

export const showInterstitial = async (): Promise<boolean> => {
  if (!isAdMobAvailable || !isInterstitialLoaded || !interstitialAd) {
    console.log("📺 Interstitial not ready");
    return false;
  }

  return new Promise((resolve) => {
    try {
      // Listen for ad close event BEFORE showing
      const closeListener = interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log("📺 Interstitial closed by user");
          useAdStore.getState().actions.setAdShowing(false); // Enable other ads
          closeListener(); // Remove listener
          resolve(true); // Ad was watched
        },
      );

      // Also handle errors
      const errorListener = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        () => {
          console.log("📺 Interstitial error during show");
          errorListener();
          resolve(false);
        },
      );

      interstitialAd.show();
      useAdStore.getState().actions.setAdShowing(true); // Disable other ads
      useAdStore.getState().actions.markInterstitialShown();
    } catch (error) {
      console.log("📺 Interstitial show error:", error);
      useAdStore.getState().actions.setAdShowing(false); // Reset on error
      resolve(false);
    }
  });
};

// ==========================================
// REWARDED ADS
// ==========================================

export const showRewarded = (): Promise<boolean> => {
  if (!isAdMobAvailable || !isRewardedLoaded || !rewardedAd) {
    console.log("🎁 Rewarded not ready");
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const unsubscribeReward = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        unsubscribeReward();
        useAdStore.getState().actions.setAdShowing(false);
        useAdStore.getState().actions.markRewardedShown();
        resolve(true);
      },
    );

    const unsubscribeClose = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubscribeClose();
        useAdStore.getState().actions.setAdShowing(false);
      },
    );

    const unsubscribeError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      () => {
        unsubscribeError();
        useAdStore.getState().actions.setAdShowing(false);
        resolve(false);
      },
    );

    try {
      if (rewardedAd) {
        rewardedAd.show();
        useAdStore.getState().actions.setAdShowing(true);
      } else {
        throw new Error("Rewarded ad instance is null");
      }
    } catch (error) {
      console.log("🎁 Rewarded show error:", error);
      useAdStore.getState().actions.setAdShowing(false);
      resolve(false);
    }
  });
};

// ==========================================
// INITIALIZATION
// ==========================================

let isInitialized = false;

// PERFORMANCE: Deferred initialization to prevent blocking splash/animations
export const initializeAds = () => {
  if (isInitialized) return; // Prevent double init

  if (!isAdMobAvailable) {
    console.log("📺 AdMob not available, skipping initialization");
    return;
  }

  isInitialized = true;

  // Defer ad loading to prevent JS bridge contention during startup
  // This allows splash screen and initial animations to complete smoothly
  setTimeout(async () => {
    console.log("📺 Initializing ads (deferred)...");

    // Ensure persistence is loaded first, then init timer
    await useAdStore.getState().actions.loadAdState();
    useAdStore.getState().actions.initializeAdTimer();

    // Families Policy Configuration
    if (isAdMobAvailable) {
      const mobileAds = require("react-native-google-mobile-ads").default;
      mobileAds()
        .setRequestConfiguration({
          // Child-directed setting
          tagForChildDirectedTreatment: true,
          // Under-age of consent setting
          tagForUnderAgeOfConsent: true,
          // Content rating: General audiences (G)
          maxAdContentRating: MaxAdContentRating.G,
        })
        .then(() => {
          console.log("📺 AdMob configuration set for Families Policy");
        });
    }

    loadInterstitial();
  }, 1500); // 1.5s delay after app is interactive
};

export const isInterstitialReady = () =>
  isAdMobAvailable && isInterstitialLoaded;
