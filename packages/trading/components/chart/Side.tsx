import React from "react";
import Animated from "react-native-reanimated";

import { numberWithCommas } from "./Handler"
import { Candle } from "./CandleType"

export default function Side(props:{candleSetter:(setter:(candle:Candle<{}>)=>void)=>void}){
    const [candle, setCandle] = React.useState<Candle<{}>>()
    props.candleSetter(setCandle)
    return(<Animated.View
      style={{
        backgroundColor:'#CCC',
        opacity:0.9,
      }}
    >
      <Animated.Text>{candle?.date}</Animated.Text>
      <Animated.Text>{numberWithCommas(candle?.open)}</Animated.Text>
      <Animated.Text style={{color:'red'}}>{numberWithCommas(candle?.high)}</Animated.Text>
      <Animated.Text style={{color:'blue'}}>{numberWithCommas(candle?.low)}</Animated.Text>
      <Animated.Text>{numberWithCommas(candle?.close)}</Animated.Text>
      <Animated.Text>{numberWithCommas(candle?.volume)}</Animated.Text>
    </Animated.View>)
  
  }