import React from "react";
import { StyleSheet, View, Platform } from "react-native";

import Chart from "../components/chart/Chart";
import Handler from  "../components/chart/Handler"
import Side from "../components/chart/Side"
import { Candle, Chart as ChartType, AsCandleConfig, AsChartConfig } from "../components/chart/CandleType"
import hloc from "../components/indices/hloc";
import volume from "../components/indices/volume";
import mpt1 from "../components/indices/mpt1";
import tdd from "../components/indices/tdd";
import mfi from "../components/indices/mfi";
import bolmfi from "../components/indices/bolmfi";
import ii from "../components/indices/ii";
import bolii from "../components/indices/bolii";
// import bolmfiii from "./indices/bolmfiii";
import {CandlePlot as Plot} from "../components/chart/Plot"

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
  },
});


export default (props:{data:Candle<{}>[], width:number, sizeRef?:React.MutableRefObject<(shift: number, candleCount:number) => void>}) => {
  const [shift, setShift] = React.useState(0)
  const rawData = React.useRef(props.data)
  const rightWidth = Platform.OS=='web'?60:50
  const width = props.width - rightWidth
  const candleCount = 40
  const charts:ChartType<
    AsChartConfig<typeof hloc> |
    AsChartConfig<typeof volume> |
    AsChartConfig<typeof mpt1> |
    AsChartConfig<typeof tdd> | 
    AsChartConfig<typeof mfi> |
    AsChartConfig<typeof bolmfi> | 
    AsChartConfig<typeof ii> |
    AsChartConfig<typeof bolii>// |
    // AsChartConfig<typeof bolmfiii> 
  >[] = [
    {height: width / 4, chartIndex:hloc, config:{bollingers:[{fill:'green', count:20, exp:2}]}},
    {height: width / 16},
    {height: width / 8, chartIndex:volume},
    {height: width / 16},
    {height: width / 8, chartIndex:mpt1, config:{depth:20, subDepth:756, include:[1,5,10,15,20]}},
    {height: width / 16},
    {height: width / 8, chartIndex:tdd, config:{depth:252}},
    {height: width / 16},
    {height: width / 8, chartIndex:mfi, config:{depth:10}},
    {height: width / 16},
    {height: width / 8, chartIndex:ii, config:{depth:21}},
    {height: width / 16},
    {height: width / 8, chartIndex:bolmfi, config:{depth:756, bolingerIndex:0}},
    {height: width / 16},
    {height: width / 8, chartIndex:bolii, config:{depth:756, bolingerIndex:0}},
    // {height: width / 16},
    // {height: width / 8, chartIndex:bolmfiii, config:{depth:756, bolingerIndex:0}},
  ]
  if(rawData.current != props.data){
    props.data.forEach((value, index ,array) => {
      if (index > 0)
        value.prev = array[index - 1]
      value.extra = {}

      if (index < array.length-1){
        const change = array[index +1].open/value.close
        if (Math.abs(1- change)>0.3)
          value.willChange = change 
      }
      charts.forEach((handler)=>{
        handler.chartIndex?.setData(value, handler.config)
      })
    })
    rawData.current = props.data
  }
  const candles = props.data.slice(props.data.length -candleCount -shift, props.data.length -shift);
  const caliber = candles.length?(width / candles.length):0
  charts.forEach((chart)=>{chart.aggregate = {values:[], zValues:[], domain:[0, 0]}});
  candles.forEach((value, index)=>{
    charts.forEach((handler, hIndex)=>{
      const aggregate = charts[hIndex].aggregate
      if(aggregate){
        handler.chartIndex?.setValues(aggregate, value)
      }
    })
  })
  charts.forEach((handler, hIndex)=>{
    const aggregate = charts[hIndex].aggregate
    if(handler.chartIndex && aggregate){
      handler.chartIndex?.setDomains(aggregate)
    }
  })
  const candleRef = React.useRef<(candle:Candle<{}>)=>void>((candle)=>{})
  const shiftRef = React.useRef<(shift:number)=>void>((shift)=>{setShift(shift); props.sizeRef?.current(shift, candleCount)})
  candleRef.current = (candle)=>{}
  return (
    <View style={{width:props.width}}>
      <View style={{width:width}}>
        {charts.map((chartHandler, index)=>chartHandler.chartIndex?(
          <View style={styles.container} key={index}>
            <Chart 
              {...{ candles, width }}
              aggregate={chartHandler.aggregate}
              height={chartHandler.height}
              chartIndex={chartHandler.chartIndex}
            />
          </View>
        ):(
          <View style={[styles.container, {minHeight:chartHandler.height}]} key={index}/>
        ))}
        <Handler caliber={caliber} candles={candles} width={width} charts={charts} candleRef={candleRef} shiftRef={shiftRef} rightWidth={rightWidth}/>
      </View>
        <Plot candles={candles as Candle<any>[]} size={[props.width, props.width * 0.75]} subDepth={(charts[4].config as AsChartConfig<typeof mpt1>).subDepth}/>
      <Side candleSetter={(setter)=>{candleRef.current = setter}}/>
    </View>
  );
};