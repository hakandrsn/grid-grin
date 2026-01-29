import React, { createContext, useContext } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";

interface PreviewData {
  row: number;
  col: number;
  shape: number[][]; // 1 or 0
  color: string;
}

interface PreviewContextType {
  activePreview: SharedValue<PreviewData | null>;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

export const PreviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const activePreview = useSharedValue<PreviewData | null>(null);

  const contextValue = React.useMemo(
    () => ({ activePreview }),
    [activePreview],
  );

  return (
    <PreviewContext.Provider value={contextValue}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
};
