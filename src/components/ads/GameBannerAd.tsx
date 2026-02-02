import { useAdActions, useIsAdShowing } from "@/src/store/adStore";
import { AD_CONFIG } from "@/src/utils/constants";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

// ==========================================
// CHECK IF ADMOB IS AVAILABLE
// ==========================================

let isAdMobAvailable = false;
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const admob = require("react-native-google-mobile-ads");
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
  isAdMobAvailable = true;
} catch {
  isAdMobAvailable = false;
}

// ==========================================
// BANNER AD COMPONENT
// ==========================================

interface GameBannerAdProps {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: () => void;
}

const GameBannerAd: React.FC<GameBannerAdProps> = ({
  onAdLoaded,
  onAdFailedToLoad,
}) => {
  const adActions = useAdActions();
  const isAdShowing = useIsAdShowing();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAdMobAvailable) {
      setIsVisible(true);
    }
  }, []);

  if (!isAdMobAvailable || !BannerAd || !BannerAdSize) {
    return null;
  }

  // Hide banner if a full-screen ad involves ensuring no multiple ads are shown
  if (isAdShowing) {
    return null;
  }

  const getBannerId = () => {
    if (__DEV__ && TestIds) return TestIds.BANNER;
    return Platform.OS === "ios"
      ? AD_CONFIG.banner.ios
      : AD_CONFIG.banner.android;
  };

  const handleAdLoaded = () => {
    adActions.setBannerReady(true);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (_error: any) => {
    adActions.setBannerReady(false);
    onAdFailedToLoad?.();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.bannerContainer}>
      <Text style={styles.adLabel}>Reklam</Text>
      <View style={styles.adWrapper}>
        <BannerAd
          unitId={getBannerId()}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailedToLoad}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 10, // Add spacing around banner
  },
  adLabel: {
    fontSize: 10,
    color: "#fff",
    marginBottom: 4,
    opacity: 0.7,
  },
  adWrapper: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50, // Minimum height for banner
  },
});

export default GameBannerAd;
