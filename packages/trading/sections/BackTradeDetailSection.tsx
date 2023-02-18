import * as React from 'react';
import { TouchableOpacity ,Text, View, Button } from 'react-native';
import Separator from '../components/Separator';
import { BackTradeRow } from './BackTradeSyncSection';

export type Popup = {x?:number, y?:number, idx?:number}

export default function BackTradeDetailSection({resultRow, popup, navigation, setPopup}:{
    resultRow?:BackTradeRow,
    popup:Popup,
    navigation:any
    setPopup:(popup:Popup)=>void,
}) {
    const [popupHeight, setPopupHeight] = React.useState(0)
    const navigateDetail = (fullcode:string)=>{
        navigation.navigate("Root", {
            screen: 'DetailScreen',
            params: {full_code: fullcode}
        })
    }
    const extra = resultRow?resultRow[1].extra:undefined
    const earn = (resultRow?resultRow[1].earn||0:0)
    const ratio = (extra?extra.ratio:0)
    const count = (extra?extra.earnCount:1)
    const earnAvg = earn / count
    const earnStd = extra?Math.sqrt(extra.earnPow/count - (earnAvg * earnAvg)):0
    const ratioAvg = ratio / count
    const ratioStd = extra?Math.sqrt(extra.ratioPow/count - (ratioAvg * ratioAvg)):0

    const avgs = extra?[extra.sums[0]/extra.counts[0], extra.sums[1]/extra.counts[1]]:[0, 0]
    const lowStd = extra?Math.sqrt(extra.sumsPow[0]/extra.counts[0] - avgs[0] * avgs[0]):0
    const highStd = extra?Math.sqrt(extra.sumsPow[1]/extra.counts[1] - avgs[1] * avgs[1]):0
    const ratioAvgs =  extra?[extra.ratios[0]/extra.counts[0], extra.ratios[1]/extra.counts[1]]:[0, 0]
    const lowRatioStd = extra?Math.sqrt(extra.ratiosPow[0]/extra.counts[0] - ratioAvgs[0] * ratioAvgs[0]):0
    const highRatioStd = extra?Math.sqrt(extra.ratiosPow[1]/extra.counts[1] - ratioAvgs[1] * ratioAvgs[1]):0
    return (
    <>
    <View style={{width:'100%', height:popupHeight}}/>
    {resultRow?(
    <View
        style={{
          position: 'absolute',
          top: popup.y,
          left: popup.x,
          backgroundColor: 'white',
          borderColor:'#000',
          borderWidth: 2,
          padding:5
        }}
        onLayout={(e)=>{setPopupHeight(e.nativeEvent.layout.height)}}>
        <Text>{resultRow[0]}</Text>
        <Text>누적 수익금: {earn}원 [{extra?.sums[0]}원, {extra?.sums[1]}원]</Text>
        <Text>수익금 평균: {earnAvg.toFixed(2)}원 [{avgs[0].toFixed(2)}원, {avgs[1].toFixed(2)}원]</Text>
        <Text>수익금 표준편차: {earnStd.toFixed(2)}원 [{lowStd.toFixed(2)}원, {highStd.toFixed(2)}원]</Text>
        <Text>수익률 평균: {ratioAvg.toFixed(2)}% [{ratioAvgs[0].toFixed(2)}%, {ratioAvgs[1].toFixed(2)}%]</Text>
        <Text>수익률 표준편차: {ratioStd.toFixed(2)}% [{lowRatioStd.toFixed(2)}%, {highRatioStd.toFixed(2)}%]</Text>
        <Text>거래 횟수: {count}  [{extra?.counts[0]}, {extra?.counts[1]}]</Text>
        <Text>누적 회전율: {(extra?extra.cashRatio*100:0).toFixed(2)}%</Text>
        {extra?.domains?<Text>최대 수익/손실액: [{extra?.domains[0]}원, {extra?.domains[1]}원]</Text>:undefined}
        {extra?.ratioDomains?<Text>최대 수익/손실률: [{extra?.ratioDomains[0]}원, {extra?.ratioDomains[1]}원]</Text>:undefined}
        <Separator/>
        <Text>매도</Text>
        {resultRow[1].sells.map((v, k)=>(<TouchableOpacity key={k} onPress={()=>{navigateDetail( v.stock['full_code'])}}>
          <Text>{v.stock['full_code']}:{v.stock['codeName']}:{v.candle.close}원:({v.minCorr.toFixed(2)})</Text>
          </TouchableOpacity>
        ))}
        <Separator/>
        <Text>매수</Text>
        {resultRow[1].buys.map((v, k)=>(<TouchableOpacity key={k} onPress={()=>{navigateDetail( v.stock['full_code'])}}>
          <Text>{v.stock['full_code']}:{v.stock['codeName']}:{v.candle.close}원:({v.minCorr.toFixed(2)})</Text>
          </TouchableOpacity>  
        ))}
        <Separator/>
        <Text>거래</Text>
        {resultRow[1].trades.map((v, k)=>(// <TouchableOpacity key={k} onPress={()=>{navigateDetail(v.split(' ')[0])}}>
          <Text key={k}>{v}</Text> //</TouchableOpacity>
        ))
        }
        <Separator/>
        <Text>보유</Text>
        {Object.entries<any>(resultRow[1].currentStocks).map((v, k)=>(<TouchableOpacity key={k} onPress={()=>{navigateDetail(v[0])}}>
          <Text>{v[0]}:{v[1][0]}</Text>
        </TouchableOpacity>))}
        <Button title={'go portfolio'} onPress={()=>{navigation.navigate("Portfolio", {
          screen: 'PortfolioScreen',
          params: {
            buys: resultRow[1].buys.map((v)=>v.stock['full_code']).join(','),
            sells:resultRow[1].sells.map((v)=>v.stock['full_code']).join(','),
          }
      })}}/>
        <Button title={'close'} onPress={()=>{setPopup({});setPopupHeight(0)}}/>
      </View>):undefined}
      </>)
}