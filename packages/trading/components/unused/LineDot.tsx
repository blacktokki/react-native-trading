import React from "react";
import { Line } from "react-native-svg";
import { CandleProps } from "./CandleType"

export default ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.dd || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.dd || 0)
  const y2 = scaleY(candle.extra?.tdd || 0)
  const py2 = scaleY(candle.prev?.extra?.tdd || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={"blue"} strokeWidth={3}
        />
        <Line
            x1={x}
            x2={px}
            y1={y2}
            y2={py2}
            stroke={"red"} strokeWidth={3}
        />
    </>
  );
};