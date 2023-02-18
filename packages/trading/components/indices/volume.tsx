import React from "react";
import { Rect } from "react-native-svg";
import { CandleProps, IndexType } from "../chart/CandleType"

const MARGIN = 1;

type CandleConfig = {
  volume?:{
    volumeUp: boolean;
    mas?:{
      vol:number,
      val:number
    }[]
  }
}

const Bar = ({ candle, index, width, scaleY, scaleBody }: CandleProps<CandleConfig>) => {
  const { volume } = candle;
  const volumeUp = candle.extra?.volume?.volumeUp
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
type Config = {
  mas?: number[]
}

export default {
    CandleComponent: Bar,
    setData: (candle, config)=>{
      if (candle.extra){
        candle.extra.volume = {
          volumeUp: candle.prev?((candle.prev.volume==candle.volume && candle.prev.extra?.volume)?candle.prev.extra.volume.volumeUp:(candle.prev.volume<candle.volume)):true
        }
        if (config && config.mas){
          const mas:(typeof candle.extra.volume.mas) = []
          let prev = candle
          let sum = 0, sumExp = 0, i =0
          let sumVal = 0, sumExpVal = 0
          config.mas.forEach((conf)=>{
            while(i < conf){
              sum += prev.volume
              sumExp += prev.volume * prev.volume
              sumVal += prev.volumeVal
              sumExpVal += prev.volumeVal * prev.volumeVal
              prev = prev.prev || prev
              i++
            }
            const avg = sum/conf
            const avgVal = sumVal/conf
            // const std =  Math.sqrt(sumExp/conf.count - avg * avg)
            mas.push({vol:avg, val:avgVal})
          })
          candle.extra.volume.mas = mas
        }
      }
    },
    setValues: (prev, candle)=>{
      prev.values.push(candle.volume)
    },
    setDomains: (values)=>{
      values.domain = values.values.length?[Math.min(...values.values, 0), Math.max(...values.values)]:[0, 0]
    }
} as IndexType<Config, CandleConfig>