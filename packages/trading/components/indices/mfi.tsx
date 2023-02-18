import React from "react";
import { Line } from "react-native-svg";
import { CandleProps, IndexType } from "../chart/CandleType"

type CandleConfig = {
  mfi?:{
    tp:number
    value:number
  }
}

const LineDot = ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps<CandleConfig>) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.mfi?.value || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.mfi?.value || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={"red"} strokeWidth={3}
        />
    </>
  );
};

type Config = {
  depth:number
}

export default {
    CandleComponent: LineDot,
    setData: (candle, config)=>{
      const mfiDepth = config.depth
      if (candle.extra){
        const tp = (candle.close + candle.low + candle.high)/3
        candle.extra.mfi = {tp:tp * (((candle.prev?.extra?.mfi)?(Math.abs(candle.prev.extra.mfi.tp)<tp):true)?1:-1), value:0}
        let prev = candle
        let plus = 0, minus = 0
        for(let i =0; i < mfiDepth; i++){
          const rmf = (prev.extra?.mfi?.tp || 0) * prev.volume
          if (rmf>0) plus += rmf
          else minus += -rmf          
          prev = prev.prev || prev
        }
        candle.extra.mfi.value = 100 * plus / (plus + minus)
      }
    },
    setValues: (prev, candle)=>{
      /*
      if(candle.extra?.mfi){
        prev.values.push(candle.extra.mfi)
        prev.values.push(candle.extra.mfi)
      }*/
    },
    setDomains: (values)=>{
      values.domain = [0, 100]
    },
    getVerticals: ()=>[20, 80]
} as IndexType<Config, CandleConfig>