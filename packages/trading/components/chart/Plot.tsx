import React from "react";
import { Svg, Text } from "react-native-svg";
import { scaleLinear } from "d3-scale";
import { Candle as CandleModel, AsCandleConfig } from "../chart/CandleType"
import mpt1 from "../indices/mpt1";
import bolmfi from "../indices/bolmfi";
import bolii from "../indices/bolii";
// import bolmfiii from "./indices/bolmfiii";
import { Circle, Line } from "react-native-svg";

function avgstd(array:number[]) {
    const n = array.length
    if (n == 0)
      return [0, 0]
    const mean = array.reduce((a, b) => a + b) / n
    return [mean, Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)]
  }

interface ChartProps {
  candles: CandleModel<
  AsCandleConfig<typeof mpt1> & 
  AsCandleConfig<typeof bolmfi> & 
  AsCandleConfig<typeof bolii> // & 
  // AsCandleConfig<typeof bolmfiii>
  >[];
  size: [number, number];
  subDepth?: number
}

const Dot = ({id, x, y, r, px, py, d, showText }: any) => {
    return (
        <>
          <Circle
            cx={x}
            cy={y}
            r={r}
            fill={d.fill}
          />
          {(px && py)?(<Line
             x1={x} x2={px} y1={y} y2={py} stroke={"black"} strokeWidth={1}
          />):undefined}
          {showText?
            <Text x={x} y={y + (id%2?20:0)} fill="black">{d.detail?(id + "(" + d.avg.toFixed(4) + ", " + d.std.toFixed(4) + ')'):id}</Text>
          :undefined}
        </>
    );
  };

type DataType = {fill:string, avg:number, std:number, prev?:DataType, detail?:boolean}

export default function Plot({domainX, domainY, data, size, showText, r}:{
  domainX:[number, number], 
  domainY:[number, number], 
  data:DataType[],
  size:[number, number],
  showText:boolean,
  r:number
}){
  const scaleX = scaleLinear().domain(domainX).range([0, size[0]]);
  const scaleY = scaleLinear().domain(domainY).range([size[1], 0])
  return (
    <Svg width={size[0]} height={size[1]}>
      {data.map((d, i)=>{
        const x = scaleX(d.std)
        const y = scaleY(d.avg)
        const px = d.prev?scaleX(d.prev.std): undefined
        const py = d.prev?scaleY(d.prev.avg): undefined
        return (<Dot
            key={i}
            id={i}
            {...{ x, y ,r, px, py, d, showText}}
        />);}
      )}
        <Line x1={0} x2={size[0]} y1={scaleY(0)} y2={scaleY(0)} stroke={"red"} strokeWidth={1}/>
        <Line x1={scaleX(0)} x2={scaleX(0)} y1={0} y2={size[1]} stroke={"red"} strokeWidth={1}/>
        <Line x1={0} x2={size[0]} y1={size[1]} y2={0} stroke={"red"} strokeWidth={1}/>
    </Svg>
  );
}

export const CandlePlot = ({ candles, size, subDepth }: ChartProps) => {
  const candle = candles[candles.length-1]
  const depth = candle?(candle.extra?.mpt1?.mpts.length||0):0
  let prev:DataType|undefined = undefined
  const data:DataType[] = candle?[...Array(depth).keys()].map((v)=>{
    let fill = ''
    if (candles.length == 0)
      return {fill, avg:0, std:0}
    const arr:number[] = []
    let _candle = candle
    for(let i=0; i<(subDepth || 20); i++){
      const multiDot = _candle.extra?.mpt1?.mpts
      if (multiDot){
        fill = multiDot[v].fill
        arr.push(multiDot[v].value)
      }
      else
        arr.push(0)
      _candle = _candle.prev || _candle
    }
    const [avg, std] = avgstd(arr)
    prev = {fill, avg, std:std, prev, detail:(v==depth-1||v==0)}
    return prev
  }):[]
  if (candle && candle.extra?.bolmfi?.avg && candle.extra?.bolmfi?.std)
    data.push({fill:'orange', avg:candle.extra.bolmfi.avg, std:candle.extra.bolmfi.std, detail:true})
  if (candle && candle.extra?.bolii?.avg && candle.extra?.bolii?.std)
    data.push({fill:'orange', avg:candle.extra.bolii.avg, std:candle.extra.bolii.std, detail:true})
  // if (candle && candle.extra?.bolmfiii?.avg && candle.extra?.bolmfiii?.std)
  //  data.push({fill:'orange', avg:candle.extra.bolmfiii.avg, std:candle.extra.bolmfiii.std, detail:true})
  const avgOnly = data.map((v)=>v.avg)
  const stdOnly = data.map((v)=>v.std)
  const mins = data.length?Math.min(...stdOnly, ...avgOnly):0
  const maxs = data.length?Math.max(...stdOnly, ...avgOnly):0
  return <Plot size={size} data={data} domainX={[mins -0.5, maxs + 0.5]} domainY={[mins -0.5, maxs + 0.5]} showText={true} r={6}/>
};