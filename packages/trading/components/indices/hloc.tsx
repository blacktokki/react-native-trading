import math from "mathjs";
import React from "react";
import { Line, Rect } from "react-native-svg";
import { CandleProps, IndexType } from "../chart/CandleType"

const MARGIN = 1;

const Bollinger = (props:any)=>{// x + width element prev
  return (<>
      <Line
        x1={props.x + props.width}
        y1={props.scaleY(props.element.high)}
        x2={props.x}
        y2={props.scaleY(props.prev.high)}
        stroke={props.element.fill}
        strokeWidth={2}
      />
      <Line
        x1={props.x + props.width}
        y1={props.scaleY(props.element.mid)}
        x2={props.x}
        y2={props.scaleY(props.prev.mid)}
        stroke={props.element.fill}
        strokeWidth={2}
      />
      <Line
        x1={props.x + props.width}
        y1={props.scaleY(props.element.low)}
        x2={props.x}
        y2={props.scaleY(props.prev.low)}
        stroke={props.element.fill}
        strokeWidth={2}
      />
    </>
  )
}
type CandleConfig = {
  hloc?:{
    up: boolean;
    bollingers?: {
        high:number,
        mid:number,
        low:number,
        std:number,
        fill:string
        _gap:number
    }[]
  }
}

const Candle = ({ candle, index, width, scaleY, scaleBody }: CandleProps<CandleConfig>) => {
  const { close, open, high, low } = candle;
  const up = candle.extra?.hloc?.up;
  const fill = up ? "#E33F64" : "#4A9AFA";
  const x = index * width;
  const max = Math.max(open, close);
  const min = Math.min(open, close);
  const margin = Math.min(MARGIN, width*0.25)
  const prev = candle.prev?.extra?.hloc?.bollingers
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
      {(candle.extra?.hloc?.bollingers&& prev)?(
        candle.extra?.hloc?.bollingers.map((element, index)=>{
          return(
            <Bollinger
              key={index}
              x={x}
              width={width}
              element={element}
              prev={prev[index]}
              scaleY={scaleY}
            />
          )
        })
      ):undefined}
    </>
  );
};

type Config = {
  bollingers?: {
    exp:number
    count:number
    fill:string
  }[]
}

export default {
    CandleComponent: Candle,
    setData: (candle, config)=>{
      let hlocUp;
      if (candle.open==candle.close)
        hlocUp = candle.prev?((candle.prev.close==candle.open && candle.prev.extra?.hloc)?candle.prev.extra.hloc.up:(candle.prev.close<candle.open)):true
      else
        hlocUp = candle.open < candle.close
      if (candle.extra){
        candle.extra.hloc = {up: hlocUp}
        if(config && config.bollingers){
          const bollingers:(typeof candle.extra.hloc.bollingers) = []
          let prev = candle
          let sum = 0, sumExp = 0, i =0
          config.bollingers.forEach((conf, ii)=>{
            while(i < conf.count){
              sum += prev.close
              sumExp += prev.close * prev.close
              prev = prev.prev || prev
              i++
            }
            const avg = sum/conf.count
            const std =  Math.sqrt(sumExp/conf.count - avg * avg)
            bollingers.push({high:avg + conf.exp * std, low:avg - conf.exp * std, mid:avg, fill:conf.fill, std:std, _gap:(avg / (prev.extra?.hloc?.bollingers?prev.extra.hloc.bollingers[ii].mid:avg) -1)*100})
          })
          candle.extra.hloc.bollingers = bollingers
        }
      }
    },
    setValues: (prev, candle) =>{
      prev.values.push(candle.low)
      prev.values.push(candle.high)
      candle.extra?.hloc?.bollingers?.forEach((value=>{
        prev.values.push(value.low)
        prev.values.push(value.high)
      }))
    },
    setDomains: (values)=>{
      values.domain = values.values.length?[Math.min(...values.values), Math.max(...values.values)]:[0, 0]
    }
} as IndexType<Config, CandleConfig>