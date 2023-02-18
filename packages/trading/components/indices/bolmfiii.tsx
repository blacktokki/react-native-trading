import React from "react";
import { Line } from "react-native-svg";
import { Candle, CandleProps, IndexType, AsCandleConfig} from "../chart/CandleType"
import hloc from "./hloc";
import mfi from "./mfi";
import ii from "./ii"


type CandleConfig = AsCandleConfig<typeof hloc> & AsCandleConfig<typeof mfi> & AsCandleConfig<typeof ii> & {
    bolmfiii?:{
        hold?:number,
        holdStd?:number,
        value:number, //일간수익
        value2:number, //누적수익(1회분)
        num:number,
        count:number,
        //avg?:number,
        //avgExp?:number, 
        //std?:number,
        // _first?:Candle<CandleConfig>
    }
}

const LineDot = ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps<CandleConfig>) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.bolmfiii?.value2 || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.bolmfiii?.value2 || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={candle.prev?.extra?.bolmfiii?.hold?"orange":"blue"} strokeWidth={3}
        />
    </>
  );
};

type Config = {
    bolingerIndex: number
    // depth: number
    maxHold?: number
    minTradeDays?: number
    yieldRatio?: number
    stdevRatio?: number
}

export default {
    CandleComponent: LineDot,
    setData: (candle, config)=>{
        if (candle.extra?.hloc?.bollingers && candle.extra?.mfi && candle.extra.ii){
            /*
            let prev2 = candle
            for(let i = 0; i < config.depth; i++){
              prev2 = prev2.prev || prev2
            }*/
            candle.extra.bolmfiii = {value:0, value2:0, count:0, num:0}
            const bolinger = candle.extra.hloc.bollingers[config.bolingerIndex]
            const pb = (candle.close - bolinger.low) / (bolinger.high - bolinger.low) * 100
            const prevBMs = candle.prev?.extra?.bolmfiii
            candle.extra.bolmfiii.num = prevBMs?prevBMs.num + 1:0
            // const firstBMs = prev2.extra?.bolmfiii
            if (prevBMs?.hold){
              candle.extra.bolmfiii.count = prevBMs.count + 1
              candle.extra.bolmfiii.hold = (pb > 95  && candle.extra.mfi.value < 80 && candle.extra.ii.value < 0 || 
                                            candle.willChange || //액면분할
                                            config.maxHold && config.maxHold<=candle.extra.bolmfiii.count || //최대보유기간 
                                            prevBMs.holdStd && prevBMs.hold - candle.close > prevBMs.holdStd  //손절기준(박스->하락)
                                          )?undefined:prevBMs.hold
              candle.extra.bolmfiii.holdStd = candle.prev?prevBMs.holdStd:undefined
              candle.extra.bolmfiii.value = candle.prev?(((candle.close/candle.prev.close) -1) * 100):0
              candle.extra.bolmfiii.value2 = candle.prev?(((candle.close/prevBMs.hold) -1) * 100):0
            }
            else{
              candle.extra.bolmfiii.hold = (pb < 5  && candle.extra.mfi.value > 25 && candle.extra.ii.value > 0 && 
                                            bolinger._gap > (config.yieldRatio || 0) && // 상승세
                                            bolinger.std/candle.close*100 <(config.stdevRatio || 15)&& //변동성
                                            candle.extra.bolmfiii.num > (config.minTradeDays || 0) // 최소 거래일
                                          )?candle.close:undefined
              candle.extra.bolmfiii.holdStd = candle.extra.bolmfiii.hold?bolinger.std:undefined
              candle.extra.bolmfiii.value2 = 0
            }
            const value = candle.extra.bolmfiii.value
            const valueExp = value * value
            /*
            const avg = prevBMs&&firstBMs?(prevBMs.avg || 0) - (firstBMs.value - value) / config.depth:value
            const avgExp = prevBMs&&firstBMs?(prevBMs.avgExp || 0) - (firstBMs.value * firstBMs.value - valueExp) / config.depth:valueExp
            candle.extra.bolmfiii.avg = avg
            candle.extra.bolmfiii.avgExp = avgExp
            candle.extra.bolmfiii.std = Math.sqrt(avgExp - avg * avg)
            */
        }
    },
    setValues: (prev, candle)=>{
      if(candle.extra?.bolmfiii){
        prev.values.push(candle.extra.bolmfiii.value2)
      }
    },
    setDomains: (values)=>{
      values.domain = [Math.min(...values.values, 0) -5, Math.max(...values.values, 0) + 5]
    },
    getVerticals: ()=>[0]
} as IndexType<Config, CandleConfig>