import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useScreenModule, Navigation, useColorScheme } from '@react-native-practice/core';
import useCachedResources from './useCachedResources';

import trading from '@react-native-practice/trading/screens';
import useSyncData from '@react-native-practice/trading/hooks/useSyncData';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const [isSyncComplete, syncRender] = useSyncData()
  const colorScheme = useColorScheme();
  useScreenModule([trading], ["trading"])
  if (!isLoadingComplete) {
    return null;
  } else if(!isSyncComplete){
    return (<SafeAreaProvider>{syncRender}</SafeAreaProvider>)
  }else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
