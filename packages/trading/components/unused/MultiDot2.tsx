import React from "react";
import { Circle } from "react-native-svg";
import { CandleProps } from "./CandleType"

const Dot = ({ x, y, z, r, fill }: any) => {
    return (
            <Circle
            cx={x + z}
            cy={y}
            r={r}
            {...{ fill }}
        />
    );
  };

export default ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps) => {
  const x = index * width;
  return (
    <>
        {(candle.extra?.multiDot || []).map((value, index) => {
            const y = scaleY((value.avg||0))
            const z = (scaleZ?scaleZ((value.std||0)): width)
            const r = width / 10
                return (<Dot
                    key={index}
                    {...{ x, y, z, r}}
                    fill={value.fill}
                />
            );
        })}
    </>
  );
};