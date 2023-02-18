import React from "react";
import { ScaleLinear } from "d3-scale";
import { Line, Rect } from "react-native-svg";
import { Candle, CandleProps } from "../CandleType"

const MARGIN = 1;

export default ({ candle, index, width, scaleY, scaleBody }: CandleProps) => {
  const { volume, volumeUp } = candle;
  const fill = volumeUp ? "#E33F64" : "#4A9AFA";
  const x = index * width;
  const max = volume;
  const min = 0;
  const margin = Math.min(MARGIN, width*0.25) 
  return (
    <>
      <Rect
        x={x + margin}
        y={scaleY(max)}
        width={width - margin * 2}
        height={scaleBody(max - min)}
        {...{ fill }}
      />
    </>
  );
};