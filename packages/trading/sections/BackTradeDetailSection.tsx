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
        <Text>?????? ?????????: {earn}??? [{extra?.sums[0]}???, {extra?.sums[1]}???]</Text>
        <Text>????????? ??????: {earnAvg.toFixed(2)}??? [{avgs[0].toFixed(2)}???, {avgs[1].toFixed(2)}???]</Text>
        <Text>????????? ????????????: {earnStd.toFixed(2)}??? [{lowStd.toFixed(2)}???, {highStd.toFixed(2)}???]</Text>
        <Text>????????? ??????: {ratioAvg.toFixed(2)}% [{ratioAvgs[0].toFixed(2)}%, {ratioAvgs[1].toFixed(2)}%]</Text>
        <Text>????????? ????????????: {ratioStd.toFixed(2)}% [{lowRatioStd.toFixed(2)}%, {highRatioStd.toFixed(2)}%]</Text>
        <Text>?????? ??????: {count}  [{extra?.counts[0]}, {extra?.counts[1]}]</Text>
        <Text>?????? ?????????: {(extra?extra.cashRatio*100:0).toFixed(2)}%</Text>
        {extra?.domains?<Text>?????? ??????/?????????: [{extra?.domains[0]}???, {extra?.domains[1]}???]</Text>:undefined}
        {extra?.ratioDomains?<Text>?????? ??????/?????????: [{extra?.ratioDomains[0]}???, {extra?.ratioDomains[1]}???]</Text>:undefined}
        <Separator/>
        <Text>??????</Text>
        {resultRow[1].sells.map((v, k)=>(<TouchableOpacity key={k} onPress={()=>{navigateDetail( v.stock['full_code'])}}>
          <Text>{v.stock['full_code']}:{v.stock['codeName']}:{v.candle.close}???:({v.minCorr.toFixed(2)})</Text>
          </TouchableOpacity>
        ))}
        <Separator/>
        <Text>??????</Text>
        {resultRow[1].buys.map((v, k)=>(<TouchableOpacity key={k} onPress={()=>{navigateDetail( v.stock['full_code'])}}>
          <Text>{v.stock['full_code']}:{v.stock['codeName']}:{v.candle.close}???:({v.minCorr.toFixed(2)})</Text>
          </TouchableOpacity>  
        ))}
        <Separator/>
        <Text>??????</Text>
        {resultRow[1].trades.map((v, k)=>(// <TouchableOpacity key={k} onPress={()=>{navigateDetail(v.split(' ')[0])}}>
          <Text key={k}>{v}</Text> //</TouchableOpacity>
        ))
        }
        <Separator/>
        <Text>??????</Text>
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