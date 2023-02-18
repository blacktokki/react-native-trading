import React from "react";
import { Circle } from "react-native-svg";
import { CandleProps } from "./CandleType"

const Dot = ({ x, y, r, fill }: any) => {
    return (
            <Circle
            cx={x}
            cy={y}
            r={r}
            {...{ fill }}
        />
    );
  };

export default ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps) => {
  const x = index * width + width * 0.5;
  return (
    <>
        {(candle.extra?.multiDot || []).map((value, index) => {
            const y = scaleY((value.value))
            const r = (scaleZ?scaleZ((value.volume)): width)/2
                return (<Dot
                    key={index}
                    {...{ x, y, r}}
                    fill={value.fill}
                />
            );
        })}
    </>
  );
};