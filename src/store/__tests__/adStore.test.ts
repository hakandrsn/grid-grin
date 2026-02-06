import { AD_RULES, useAdStore } from "../adStore";

// Mock AsyncStorage since it's a native module
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe("adStore", () => {
  const initialState = useAdStore.getState();

  beforeEach(() => {
    // Reset store to initial state before each test
    useAdStore.setState({
      ...initialState,
      lastInterstitialShown: 0,
      isInterstitialReady: false,
      isAdShowing: false,
    });
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initializeAdTimer", () => {
    it("should set lastInterstitialShown to current time if it is 0", () => {
      const now = 1000000;
      jest.setSystemTime(now);

      useAdStore.getState().actions.initializeAdTimer();

      expect(useAdStore.getState().lastInterstitialShown).toBe(now);
    });

    it("should NOT update lastInterstitialShown if it is already set", () => {
      const existingTime = 5000;
      useAdStore.setState({ lastInterstitialShown: existingTime });

      const now = 1000000;
      jest.setSystemTime(now);

      useAdStore.getState().actions.initializeAdTimer();

      expect(useAdStore.getState().lastInterstitialShown).toBe(existingTime);
    });
  });

  describe("canShowInterstitial", () => {
    it("should return false if ad is not ready", () => {
      // Even if enough time passed
      useAdStore.setState({
        lastInterstitialShown:
          Date.now() - AD_RULES.interstitial.minTimeBetweenAds - 1000,
        isInterstitialReady: false,
      });

      expect(useAdStore.getState().actions.canShowInterstitial()).toBe(false);
    });

    it("should return false if time constraint is not met", () => {
      const now = Date.now();
      useAdStore.setState({
        lastInterstitialShown: now, // Just shown
        isInterstitialReady: true,
      });

      expect(useAdStore.getState().actions.canShowInterstitial()).toBe(false);
    });

    it("should return true if ad is ready AND time constraint is met", () => {
      const now = Date.now();
      // Set last shown to just beyond the limit
      const lastShown = now - AD_RULES.interstitial.minTimeBetweenAds - 100;

      useAdStore.setState({
        lastInterstitialShown: lastShown,
        isInterstitialReady: true,
      });

      expect(useAdStore.getState().actions.canShowInterstitial()).toBe(true);
    });
  });

  describe("markInterstitialShown", () => {
    it("should update lastInterstitialShown to now and reset ready status", () => {
      const now = 123456789;
      jest.setSystemTime(now);

      useAdStore.setState({ isInterstitialReady: true });

      useAdStore.getState().actions.markInterstitialShown();

      expect(useAdStore.getState().lastInterstitialShown).toBe(now);
      expect(useAdStore.getState().isInterstitialReady).toBe(false);
    });

    it("should increment totalInterstitialsShown", () => {
      const initialCount = 5;
      useAdStore.setState({ totalInterstitialsShown: initialCount });

      useAdStore.getState().actions.markInterstitialShown();

      expect(useAdStore.getState().totalInterstitialsShown).toBe(
        initialCount + 1,
      );
    });
  });
});
