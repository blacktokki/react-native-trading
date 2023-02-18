import React from "react";
import { Line } from "react-native-svg";
import { Candle, CandleProps, IndexType, AsCandleConfig} from "../chart/CandleType"
import hloc from "./hloc";
import ii from "./ii";


type CandleConfig = AsCandleConfig<typeof hloc> & AsCandleConfig<typeof ii> & {
    bolii?:{
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
  const y = scaleY(candle.extra?.bolii?.value2 || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.bolii?.value2 || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={candle.prev?.extra?.bolii?.hold?"orange":"blue"} strokeWidth={3}
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
        if (candle.extra?.hloc?.bollingers && candle.extra?.ii){
            let prev2 = candle
            for(let i = 0; i < config.depth; i++){
              prev2 = prev2.prev || prev2
            }
            candle.extra.bolii = {value:0, value2:0, _first:prev2}
            const bolinger = candle.extra.hloc.bollingers[config.bolingerIndex]
            const pb = (candle.close - bolinger.low) / (bolinger.high - bolinger.low) * 100
            const prevBIs = candle.prev?.extra?.bolii
            const firstBIs = prev2.extra?.bolii
            if (prevBIs?.hold){
              candle.extra.bolii.hold = (pb > 95 && candle.extra.ii.value < 0)?undefined:prevBIs.hold
              candle.extra.bolii.value = candle.prev?(((candle.close/candle.prev.close) -1) * 100):0
              candle.extra.bolii.value2 = candle.prev?(((candle.close/prevBIs.hold) -1) * 100):0
            }
            else{
              candle.extra.bolii.hold = (pb < 5 && candle.extra.ii.value > 0)?candle.close:undefined
              candle.extra.bolii.value2 = 0
            }
            const value = candle.extra.bolii.value
            const valueExp = value * value
            const avg = prevBIs&&firstBIs?(prevBIs.avg || 0) - (firstBIs.value - value) / config.depth:value
            const avgExp = prevBIs&&firstBIs?(prevBIs.avgExp || 0) - (firstBIs.value * firstBIs.value - valueExp) / config.depth:valueExp
            candle.extra.bolii.avg = avg
            candle.extra.bolii.avgExp = avgExp
            candle.extra.bolii.std = Math.sqrt(avgExp - avg * avg)
        }
    },
    setValues: (prev, candle)=>{
      if(candle.extra?.bolii){
        prev.values.push(candle.extra.bolii.value2)
      }
    },
    setDomains: (values)=>{
      values.domain = [Math.min(...values.values, 0) -5, Math.max(...values.values, 0) + 5]
    },
    getVerticals: ()=>[0]
} as IndexType<Config, CandleConfig>