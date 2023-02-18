import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Line } from "react-native-svg";
import { PanGestureHandler, TapGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
    add,
    diffClamp,
    eq,
    modulo,
    sub
  } from "react-native-reanimated";  
import { HandlerProps } from "./CandleType"

export function numberWithCommas(x?:number) {
    if (x)
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return x
  }

  
const LineHandler = ({ x, y, width, height }: { x: number, y: number; width:number, height:number}) => {
    return (
      <Svg height={height} width={width}>
        <Line
          x1={0}
          y1={0}
          x2={x}
          y2={y}
          strokeWidth={2}
          stroke="#B5B6B7"
          strokeDasharray="6 6"
        />
      </Svg>
    );
};

export default function Handler(props:HandlerProps){
    const [labelX, setLabelX] = React.useState(0)
    const [labelY, setLabelY] = React.useState(0)
    const [labelState, setLabelState] = React.useState<State>(State.UNDETERMINED)
    const [mode, setMode] = React.useState(true)
    const [labelLeft, setLabelLeft] = React.useState(0)
    const [fixLeft, setfixLeft] = React.useState(0)
    const currentY = React.useMemo(()=>props.charts.reduce((prev, cur)=>{ return [prev[0] + cur.height, prev[0]<=labelY?prev[1]+1:Math.max(prev[1],0), prev[0]<=labelY?prev[0]:prev[2]]}, [0, -1, 0]), [labelY])
    let [totalY, indexY, minY] = currentY
    const delay = React.useRef({check:0, count:0})
    const onGestureEvent = (e:any)=>{
        setLabelX(e.nativeEvent.x)
        setLabelY(e.nativeEvent.y)
        setLabelState(e.nativeEvent.state)
    }
    //console.log(labelX, labelY, WIDTH, HEIGHT)
    let translateY = diffClamp(labelY, 0, totalY)
    let translateX = add(sub(labelX, modulo(labelX, props.caliber)), props.caliber / 2);
    let opacity = eq(labelState, State.ACTIVE);
    let candleX = props.candles[Math.floor(labelX * props.candles.length/props.width)]
    let chartY = props.charts[indexY].aggregate || {domain:[0, 0]}
    let valueY = Math.floor((chartY.domain[1] + (chartY.domain[0] - chartY.domain[1])* Math.min(Math.max(0, (labelY-minY)/props.charts[indexY].height), 1)) *100)/100
    useEffect(()=>{props.candleRef?.current(candleX)}, [candleX])
    useEffect(()=>{props.shiftRef?.current(labelLeft)}, [labelLeft])
    delay.current = {check:0, count:0}
    return (
    <PanGestureHandler minDist={1} onGestureEvent={(e)=>{
      if (!mode){ 
        if (e.nativeEvent.state === State.ACTIVE)
          setLabelLeft(Math.max(fixLeft + Math.floor(e.nativeEvent.translationX/props.caliber), 0))
      }
      if (delay.current.check==0){
        delay.current.check=1
        if(mode){
          onGestureEvent(e)
        }
      }
      delay.current.count= (delay.current.count + 1)
      if (delay.current.count >= 12)
        delay.current = {check:0, count:0}
    }}
    onEnded={(e)=>{
      if(!mode)
          setfixLeft(labelLeft)
    }}
    >
      <TapGestureHandler onHandlerStateChange={(e)=>{
        if(e.nativeEvent.state === State.ACTIVE){
          if(Math.abs((e.nativeEvent.x - labelX) * (e.nativeEvent.y - labelY))<props.width * props.width / 2500 || !mode){
            setMode(!mode)
          }
          onGestureEvent(e)
        }
      }}>
      <Animated.View style={[StyleSheet.absoluteFill]}>
      {mode?(
      <>
      <Animated.View
          style={{
            width:props.width + props.rightWidth,
            height:20,
            transform: [{ translateY }],
            opacity,
            flexDirection:'row',
            ...StyleSheet.absoluteFillObject,
          }}
      >
          <LineHandler x={props.width} y={0} width={props.width} height={20}/>
          <Animated.View style={{backgroundColor:'white', height:20, top:-10, paddingRight:5}}>
            <Animated.Text style={{alignSelf: 'stretch', fontSize:10}}>{numberWithCommas(valueY)}</Animated.Text>
          </Animated.View>
      </Animated.View>
      <Animated.View
          style={{
            height:totalY + 20,
            transform: [{ translateX }],
            opacity,
            ...StyleSheet.absoluteFillObject,
          }}
      >
          <LineHandler x={0} y={totalY} width={props.width} height={totalY}/>
          <Animated.View style={{backgroundColor:'white', width:100, left:-40}}>
            <Animated.Text>{candleX?.date}</Animated.Text>
          </Animated.View>
      </Animated.View>
      </>
      ):undefined}
      </Animated.View>
      </TapGestureHandler>
    </PanGestureHandler>
    )
  }
