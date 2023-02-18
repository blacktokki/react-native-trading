import React from "react";
import { Line } from "react-native-svg";
import { Candle, CandleProps, IndexType, AsCandleConfig} from "../chart/CandleType"
import hloc from "./hloc";
import mfi from "./mfi";


type CandleConfig = AsCandleConfig<typeof hloc> & AsCandleConfig<typeof mfi> & {
    bolmfi?:{
        hold?:number,
        value:number, //일간수익
        value2:number, //누적수익(1회분)
        avg?:number,
        avgExp?:number, 
        std?:number,
        _first?:Candle<CandleConfig>
    }
}

const LineDot = ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps<CandleConfig>) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.bolmfi?.value2 || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.bolmfi?.value2 || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={candle.prev?.extra?.bolmfi?.hold?"orange":"blue"} strokeWidth={3}
        />
    </>
  );
};

type Config = {
    bolingerIndex: number
    depth: number
}

export default {
    CandleComponent: LineDot,
    setData: (candle, config)=>{
        if (candle.extra?.hloc?.bollingers && candle.extra?.mfi){
            let prev2 = candle
            for(let i = 0; i < config.depth; i++){
              prev2 = prev2.prev || prev2
            }
            candle.extra.bolmfi = {value:0, value2:0, _first:prev2}
            const bolinger = candle.extra.hloc.bollingers[config.bolingerIndex]
            const pb = (candle.close - bolinger.low) / (bolinger.high - bolinger.low) * 100
            const prevBMs = candle.prev?.extra?.bolmfi
            const firstBMs = prev2.extra?.bolmfi
            if (prevBMs?.hold){
              candle.extra.bolmfi.hold = (pb < 20 && candle.extra.mfi.value < 20)?undefined:prevBMs.hold
              candle.extra.bolmfi.value = candle.prev?(((candle.close/candle.prev.close) -1) * 100):0
              candle.extra.bolmfi.value2 = candle.prev?(((candle.close/prevBMs.hold) -1) * 100):0
            }
            else{
              candle.extra.bolmfi.hold = (pb > 80 && candle.extra.mfi.value > 80)?candle.close:undefined
              candle.extra.bolmfi.value2 = 0
            }
            const value = candle.extra.bolmfi.value
            const valueExp = value * value
            const avg = prevBMs&&firstBMs?(prevBMs.avg || 0) - (firstBMs.value - value) / config.depth:value
            const avgExp = prevBMs&&firstBMs?(prevBMs.avgExp || 0) - (firstBMs.value * firstBMs.value - valueExp) / config.depth:valueExp
            candle.extra.bolmfi.avg = avg
            candle.extra.bolmfi.avgExp = avgExp
            candle.extra.bolmfi.std = Math.sqrt(avgExp - avg * avg)
        }
    },
    setValues: (prev, candle)=>{
      if(candle.extra?.bolmfi){
        prev.values.push(candle.extra.bolmfi.value2)
      }
    },
    setDomains: (values)=>{
      values.domain = [Math.min(...values.values, 0) -5, Math.max(...values.values, 0) + 5]
    },
    getVerticals: ()=>[0]
} as IndexType<Config, CandleConfig>