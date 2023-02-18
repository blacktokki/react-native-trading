import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

type WindowType = 'portrait' | 'landscape'

export default function useResizeWindow() {
  const [window, setWindow] = useState(Dimensions.get('window'));
  const onChange = () => setWindow(Dimensions.get('window'))
  useEffect(() => {
    Dimensions.addEventListener("change", onChange);
    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  });
  return window.height >= window.width?'portrait':'landscape' as WindowType;
}