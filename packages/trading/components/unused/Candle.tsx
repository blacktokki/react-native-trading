import React from "react";
import { Line, Rect } from "react-native-svg";
import { Candle, CandleProps } from "./CandleType"

const MARGIN = 1;

export default ({ candle, index, width, scaleY, scaleBody }: CandleProps) => {
  const { close, open, high, low, up } = candle;
  const fill = up ? "#E33F64" : "#4A9AFA";
  const x = index * width;
  const max = Math.max(open, close);
  const min = Math.min(open, close);
  const margin = Math.min(MARGIN, width*0.25) 
  return (
    <>
      <Line
        x1={x + width / 2}
        y1={scaleY(low)}
        x2={x + width / 2}
        y2={scaleY(high)}
        stroke={fill}
        strokeWidth={1}
      />
      {(open==close)?(
        <Line
        x1={x + margin}
        y1={scaleY(open)}
        x2={x + width - margin}
        y2={scaleY(close)}
        stroke={fill}
        strokeWidth={1}
      />
      ):(
      <Rect
        x={x + margin}
        y={scaleY(max)}
        width={width - margin * 2}
        height={scaleBody(max - min)}
        {...{ fill }}
      />
      )}
    </>
  );
};