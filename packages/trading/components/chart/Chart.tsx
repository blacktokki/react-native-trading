import React from "react";
import { Line, Svg } from "react-native-svg";
import { scaleLinear } from "d3-scale";
import { ChartProps } from "./CandleType"

export default ({ candles, width, height, chartIndex, aggregate }: ChartProps) => {
  const _width = width / candles.length;
  const CandleComponent = chartIndex?.CandleComponent
  const { domain, zDomain } = aggregate || {domain:[0, 0]}
  const verticalLines=chartIndex?.getVerticals && aggregate?chartIndex.getVerticals(aggregate):[]
  const scaleY = scaleLinear().domain(domain).range([height, 0]);
  const scaleZ = zDomain?scaleLinear().domain(zDomain).range([0, _width]): undefined
  const scaleBody = scaleLinear()
    .domain([0, Math.max(...domain) - Math.min(...domain)])
    .range([0, height]);
  return (
    <Svg width={width} height={height}>
      {candles.map((candle, index) => CandleComponent?(
        <CandleComponent
          key={candle.date}
          width={_width}
          {...{ candle, index, scaleY, scaleZ, scaleBody }}
        />
      ):undefined)}
      {
        verticalLines.map((value, index)=>{
          return(<Line key={index} x1={0} x2={width} y1={scaleY(value) || 0} y2={scaleY(value) || 0} stroke={"red"} strokeWidth={1}/>)
        })
      }
    </Svg>
  );
};