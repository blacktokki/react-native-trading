import React from "react";
import { Line } from "react-native-svg";
import { CandleProps, IndexType } from "../chart/CandleType"

type CandleConfig = {
  ii?:{
    ii:number
    value:number    
  }
}

const LineDot = ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps<CandleConfig>) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.ii?.value || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.ii?.value || 0)
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
        const ii =  (2 * candle.close - candle.low - candle.high)/ (candle.high - candle.low) * candle.volume
        candle.extra.ii = {ii:ii, value:0}
        let prev = candle
        let iiSum = 0
        let volumeSum = 0
        for(let i =0; i < mfiDepth; i++){
          iiSum += prev.extra?.ii?.ii || 0          
          volumeSum += prev.volume
          prev = prev.prev || prev
        }
        candle.extra.ii.value = iiSum / volumeSum * 100
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
      values.domain = [-100, 100]
    },
    getVerticals: ()=>[]
} as IndexType<Config, CandleConfig>