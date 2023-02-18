import React from "react";
import { Line } from "react-native-svg";
import { CandleProps, IndexType } from "../chart/CandleType"

type CandleConfig = {
  tdd?:{
    dd:number,
    tdd:number
  }
}

const LineDot = ({ candle, index, width, scaleY, scaleZ, scaleBody }: CandleProps<CandleConfig>) => {
  const x = index * width + width * 0.5;
  const y = scaleY(candle.extra?.tdd?.dd || 0)
  const px = x - width
  const py = scaleY(candle.prev?.extra?.tdd?.dd || 0)
  const y2 = scaleY(candle.extra?.tdd?.tdd || 0)
  const py2 = scaleY(candle.prev?.extra?.tdd?.tdd || 0)
  return (
    <>
        <Line
            x1={x}
            x2={px}
            y1={y}
            y2={py}
            stroke={"blue"} strokeWidth={3}
        />
        <Line
            x1={x}
            x2={px}
            y1={y2}
            y2={py2}
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
      const tddDepth = config.depth
      if (candle.extra){
        candle.extra.tdd = {dd:0, tdd:0}
        let prev = candle
        let dds = []
        for(let i =0; i < tddDepth; i++){
          dds.push(prev.close)
          prev = prev.prev || prev
        }
        candle.extra.tdd.dd = candle.close / Math.max(...dds) - 1
        
        prev = candle
        dds = []  
        for(let i = 0; i < tddDepth; i++){
          if (prev.extra?.tdd)
            dds.push(prev.extra?.tdd?.dd)
          prev = prev.prev || prev
        }
        candle.extra.tdd.tdd = Math.min(...dds)
      }
    },
    setValues: (prev, candle)=>{
      if(candle.extra?.tdd){
        prev.values.push(candle.extra.tdd.dd)
        prev.values.push(candle.extra.tdd.tdd)
      }
    },
    setDomains: (values)=>{
      values.domain = [Math.min(...values.values, 0)-0.05, 0.05]
    },
    getVerticals: ()=>[0]
} as IndexType<Config, CandleConfig>