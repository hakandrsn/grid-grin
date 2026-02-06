import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// ==========================================
// AD CONFIGURATION
// ==========================================

export const AD_RULES = {
  // Interstitial rules
  interstitial: {
    minTimeBetweenAds: 300000, // 5 minutes between interstitial ads
  },

  // Rewarded rules
  rewarded: {
    enabled: true, // Rewarded ads for hints
  },

  // Banner rules
  banner: {
    showInGame: true, // Show banner at top of game screen
  },
};

// ==========================================
// AD STATE INTERFACE
// ==========================================

interface AdState {
  // Last shown timestamps
  lastInterstitialShown: number;
  lastRewardedShown: number;

  // Ad readiness
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  isBannerReady: boolean;

  // Statistics
  totalInterstitialsShown: number;
  totalRewardedsShown: number;
  totalBannersShown: number;

  // Global ad state
  isAdShowing: boolean; // True when a full-screen ad (Interstitial/Rewarded) is open
}

interface AdActions {
  // Interstitial
  canShowInterstitial: () => boolean;
  markInterstitialShown: () => void;
  setInterstitialReady: (ready: boolean) => void;

  // Rewarded
  canShowRewarded: () => boolean;
  markRewardedShown: () => void;
  setRewardedReady: (ready: boolean) => void;

  // Banner
  canShowBanner: () => boolean;
  setBannerReady: (ready: boolean) => void;
  initializeAdTimer: () => void;

  // Persistence
  loadAdState: () => Promise<void>;
  saveAdState: () => Promise<void>;

  // Global state
  setAdShowing: (showing: boolean) => void;
}

interface AdStore extends AdState {
  actions: AdActions;
}

// ==========================================
// STORAGE KEY
// ==========================================

const AD_STATE_KEY = "@puzzle_game_ad_state";

// ==========================================
// INITIAL STATE
// ==========================================

const initialState: AdState = {
  lastInterstitialShown: 0,
  lastRewardedShown: 0,
  isInterstitialReady: false,
  isRewardedReady: false,
  isBannerReady: false,
  totalInterstitialsShown: 0,
  totalRewardedsShown: 0,
  totalBannersShown: 0,
  isAdShowing: false,
};

// ==========================================
// AD STORE
// ==========================================

export const useAdStore = create<AdStore>((set, get) => ({
  ...initialState,

  actions: {
    // ==========================================
    // INTERSTITIAL ADS
    // ==========================================

    canShowInterstitial: () => {
      const state = get();

      // Check if enough time has passed
      const now = Date.now();
      const timeSinceLastAd = now - state.lastInterstitialShown;

      const isTimeReady =
        timeSinceLastAd >= AD_RULES.interstitial.minTimeBetweenAds;
      const isAdLoaded = state.isInterstitialReady;

      if (!isTimeReady) {
        return false;
      }

      // Check if ad is ready
      if (!isAdLoaded) {
        return false;
      }

      return true;
    },

    markInterstitialShown: () => {
      const now = Date.now();
      set((state) => ({
        lastInterstitialShown: now,
        totalInterstitialsShown: state.totalInterstitialsShown + 1,
        isInterstitialReady: false, // Will be reloaded
      }));
      get().actions.saveAdState();
    },

    setInterstitialReady: (ready: boolean) => {
      set({ isInterstitialReady: ready });
    },

    // ==========================================
    // REWARDED ADS
    // ==========================================

    canShowRewarded: () => {
      const state = get();

      if (!AD_RULES.rewarded.enabled) {
        return false;
      }

      if (!state.isRewardedReady) {
        return false;
      }

      return true;
    },

    markRewardedShown: () => {
      const now = Date.now();
      set((state) => ({
        lastRewardedShown: now,
        totalRewardedsShown: state.totalRewardedsShown + 1,
        isRewardedReady: false, // Will be reloaded
      }));
      get().actions.saveAdState();
    },

    setRewardedReady: (ready: boolean) => {
      set({ isRewardedReady: ready });
    },

    // ==========================================
    // BANNER ADS
    // ==========================================

    canShowBanner: () => {
      const state = get();
      return AD_RULES.banner.showInGame && state.isBannerReady;
    },

    setBannerReady: (ready: boolean) => {
      set({ isBannerReady: ready });
    },

    initializeAdTimer: () => {
      const state = get();
      if (state.lastInterstitialShown === 0) {
        set({ lastInterstitialShown: Date.now() });
        get().actions.saveAdState();
        console.log("📺 Ad timer initialized to NOW (first run delay)");
      }
    },

    // ==========================================
    // PERSISTENCE
    // ==========================================

    loadAdState: async () => {
      try {
        const stored = await AsyncStorage.getItem(AD_STATE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set({
            lastInterstitialShown: parsed.lastInterstitialShown || 0,
            lastRewardedShown: parsed.lastRewardedShown || 0,
            totalInterstitialsShown: parsed.totalInterstitialsShown || 0,
            totalRewardedsShown: parsed.totalRewardedsShown || 0,
            totalBannersShown: parsed.totalBannersShown || 0,
          });
        }
      } catch {
        // Silent fail for ad state loading
      }
    },

    saveAdState: async () => {
      try {
        const state = get();
        const toSave = {
          lastInterstitialShown: state.lastInterstitialShown,
          lastRewardedShown: state.lastRewardedShown,
          totalInterstitialsShown: state.totalInterstitialsShown,
          totalRewardedsShown: state.totalRewardedsShown,
          totalBannersShown: state.totalBannersShown,
        };
        await AsyncStorage.setItem(AD_STATE_KEY, JSON.stringify(toSave));
      } catch {
        // Silent fail for ad state saving
      }
    },

    setAdShowing: (showing: boolean) => {
      set({ isAdShowing: showing });
    },
  },
}));

// ==========================================
// HOOKS
// ==========================================

export const useAdActions = () => useAdStore((state) => state.actions);
export const useIsInterstitialReady = () =>
  useAdStore((state) => state.isInterstitialReady);
export const useIsRewardedReady = () =>
  useAdStore((state) => state.isRewardedReady);
export const useIsBannerReady = () =>
  useAdStore((state) => state.isBannerReady);
export const useIsAdShowing = () => useAdStore((state) => state.isAdShowing);
