import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button } from 'react-native';
import { load_stock_json, ModelToCandle, sleep, STORAGE_KEY, ddFormat, cov_and_var } from '../utils';
import { CompanyInfoBlock, CompanyResponse } from '../types';
import { Candle } from '../components/chart/CandleType';
import hloc from '../components/indices/hloc';
import volume from '../components/indices/volume';
import ii from '../components/indices/ii';
import mfi from '../components/indices/mfi';
import bolmfiii from '../components/indices/bolmfiii';

const MAX_LOAD_STOCK = 250
const MAX_RELOAD_STOCK = 250
export const backTradeContext = {
    reload_stock:0,
    sync_lock:0,
    current_date:''
}

type Result = {
  stock:CompanyInfoBlock,
  candle:Candle<any>,
  rets?:Record<string, number>,
}

type ResultExtra = {
  cashRatio:number,
  earnPow:number,
  ratio:number,
  ratioPow:number,
  earnCount: number
  sums:[number, number],
  sumsPow:[number, number],
  ratios:[number, number],
  ratiosPow:[number, number],
  counts:[number, number],
  domains?:[number, number],
  ratioDomains?:[number, number]
}

type ResultGroup = {
  buys:(Result & {minCorr:number})[],
  sells:(Result & {minCorr:number})[],
  trades:string[]
  currentStocks?:any,
  cash?:number,
  earn?:number,
  extra?:ResultExtra
}
export type BackTradeRow = [string, ResultGroup]
export type BackTradeResult = {
  result?:BackTradeRow[]
  condition?:any
  title?:string
}

async function backTrade(data_all:CompanyInfoBlock[], setter:(data_all:CompanyInfoBlock[])=>void, resultSetter:(result:BackTradeResult)=>void, show_log:number, context:typeof backTradeContext){
  let condition:any|undefined = undefined;
  try{
    condition = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY['condition']) as string)
  }
  catch(e){
    console.log(e)
  }
  console.log(condition)
  if (condition && context.sync_lock == 0){
    const writeBackTradeCandle = (candle:Candle<any>, index:number, array:Candle<any>[])=>{
      if (index > 0)
        candle.prev = array[index - 1]
      if (index < array.length-1){
        const change = array[index +1].open/candle.close
        if (Math.abs(1- change)>0.3)
          candle.willChange = change 
      }
      candle.extra = {}
      if (condition.config?.hloc)hloc.setData(candle, condition.config.hloc)
      if (condition.config?.volume)volume.setData(candle, condition.config.volume)
      if (condition.config?.mfi)mfi.setData(candle, condition.config.mfi)
      if (condition.config?.ii)ii.setData(candle, condition.config.ii)
      if (condition.config?.bolmfiii)bolmfiii.setData(candle, condition.config.bolmfiii)
    }
    context.sync_lock = 1
    context.reload_stock = 0
    let current_load_stock = 0
    const preResult:(Result & {
      dateStr:string,
      signal:'buys'|'sells'
    })[] = []
    const startDate:Date = condition.filter?.startDate || new Date(2016, 0, 1)
    const maxPrice = 25000
    data_all.forEach((item)=>{item.traded = false})
    let new_data_all = data_all.map((item)=>item)
    setter(new_data_all)
    resultSetter({})
    for (const [i, d] of data_all.entries()){
      let full_code = d.full_code
      context.reload_stock += 1
      while (context.sync_lock==2)
        await sleep(1000)
      while (current_load_stock >= MAX_LOAD_STOCK || context.reload_stock>=MAX_RELOAD_STOCK){
          await sleep(100)
          if (context.reload_stock == MAX_RELOAD_STOCK){
              console.log('reload!!!!')
              new_data_all = data_all.map((item)=>item)  // array.slice(0)
              setter(new_data_all)
          }
          else{
            context.reload_stock += 1
            console.log(current_load_stock, '/', MAX_LOAD_STOCK)
          }
      }
      current_load_stock += 1
      load_stock_json(full_code, {
        start_date:new Date(2016, 0, 1), end_date:new Date(2016, 0, 1), log_datetime:0, isSimple:1
      }).then(async(j2:CompanyResponse)=>{
          //trade start
          const candles:Candle<any>[] = j2.output.map(ModelToCandle).reverse()
          j2.output.splice(0, j2.output.length)
          candles.forEach(writeBackTradeCandle)
          data_all[i].traded = true
          if(show_log)
            console.log(i, d.codeName)
          const rets = candles.reduce((prev, value)=>{prev[value.date] = value.prev?(value.close /value.prev.close -1):0; return prev}, {} as Record<string, number>)
          candles.forEach((candle, index)=>{
            if (candle.prev?.extra.bolmfiii.hold != candle.extra.bolmfiii.hold && new Date(candle.date).valueOf() >= startDate.valueOf()){
              if(candle.prev)
                candle.prev.prev = undefined
              if(candle.extra.bolmfiii.hold==undefined||candle.close <= maxPrice)
              preResult.push({dateStr:candle.date, stock:d, candle:candle, signal:candle.extra.bolmfiii.hold?'buys':'sells', rets: candle.extra.bolmfiii.hold?rets:undefined})
            }
          })
          // trade end
          current_load_stock -= 1
      })
    }
    while (current_load_stock > 0)
      await sleep(50)
    console.log('reload!!!!')
    //////
    new_data_all = data_all.map((item)=>item)
    context.sync_lock = 0
    context.reload_stock = 0
    context.current_date = ''
    const maxStocks = 4
    const covDate = 252
    const totalCash = 1000000
    let cash = totalCash
    let earn = 0
    let extra:ResultExtra = {
      cashRatio: 0,
      earnPow: 0,
      earnCount: 0,
      ratio: 0,
      ratioPow: 0,
      sums:[0, 0],
      sumsPow: [0, 0],
      ratios: [0, 0],
      ratiosPow: [0, 0],
      counts:[0, 0],
    }
    let stocks:any = {}
    const results:[string, ResultGroup][] = []
    for(const result of Object.entries(preResult.reduce((prev, data)=>{
      if (prev[data.dateStr] == undefined)
        prev[data.dateStr] = {buys:[], sells:[], trades:[]}
      prev[data.dateStr][data.signal].push({stock:data.stock, candle:data.candle, rets:data.rets, minCorr:1})
      return prev
    }, {} as Record<string, ResultGroup>)).sort((a, b)=>a[0] > b[0]?1:-1)){
        while (context.reload_stock>=MAX_RELOAD_STOCK){
          await sleep(100)
          if (context.reload_stock == MAX_RELOAD_STOCK){
            console.log('reload!!!!')
            new_data_all = data_all.slice(0)
            setter(new_data_all)
          }
          else
            context.reload_stock += 1
        }
        context.reload_stock += 1
        //result[1].stocks = result[1].stocks.sort((a, b)=>a.candle.extra.volume.mas[0].val < b.candle.extra.volume.mas[0].val?1:-1)
        result[1].sells.filter((d)=>stocks[d.stock.full_code]).forEach((d)=>{
          const _cash = d.candle.close * stocks[d.stock.full_code][0]
          const _earn = (d.candle.close - stocks[d.stock.full_code][1].close) * stocks[d.stock.full_code][0]
          const ratio = ((d.candle.close / stocks[d.stock.full_code][1].close -1)*100)
          cash += _cash
          result[1].trades.push(`${d.stock.full_code} ${stocks[d.stock.full_code][1].close}(${stocks[d.stock.full_code][1].date}) => ${d.candle.close} ${ratio.toFixed(2)}%`)
          earn += _earn
          extra.cashRatio += _cash / totalCash
          extra.earnPow += _earn * _earn
          extra.ratio += ratio
          extra.ratioPow += ratio * ratio
          extra.earnCount += 1
          if(_earn!=0){
            const earnIdx = _earn>0?1:0
            extra.sums[earnIdx] += _earn
            extra.sumsPow[earnIdx] += _earn * _earn
            extra.ratios[earnIdx] += ratio
            extra.ratiosPow[earnIdx] += ratio * ratio
            extra.counts[earnIdx] += 1            
          }
          extra.domains = extra.domains?[Math.min(extra.domains[0], _earn), Math.max(extra.domains[1], _earn)]:[_earn, _earn]
          extra.ratioDomains = extra.ratioDomains?[Math.min(extra.ratioDomains[0], ratio), Math.max(extra.ratioDomains[1], ratio)]:[ratio, ratio]
          delete stocks[d.stock.full_code]
        })
        result[1].buys =  result[1].buys.sort((a, b)=>a.candle.extra.volume.mas[0].val < b.candle.extra.volume.mas[0].val?1:-1)
        const buys = result[1].buys.filter((value,index)=>index < result[1].buys.length * 0.5)
        buys.forEach((v2)=>{
          buys.forEach((v3)=>{
            if (v2.rets&& v3.rets){
              const cv = cov_and_var(v2.rets, v3.rets, covDate, result[0])
              if(cv[0]&&cv[1]&&cv[2])
                v2.minCorr = Math.min(v2.minCorr, cv[0]/Math.sqrt(cv[1] * cv[2]))
            }
          })
        })
        buys.sort((a, b)=>(a.minCorr > b.minCorr?1:-1)).slice(0, maxStocks - Object.keys(stocks).length).forEach((d)=>{
          const buyCount = Math.floor((cash / (maxStocks -  Object.keys(stocks).length)) /d.candle.close)
          stocks[d.stock.full_code] = [buyCount, d.candle]
          cash -= d.candle.close * stocks[d.stock.full_code][0]
          result[1].trades.push(`${d.stock.full_code} ${d.candle.close} ${buyCount}주`)
        })
        result[1].cash = cash
        result[1].earn = earn
        result[1].currentStocks = {...stocks}
        result[1].buys.forEach((v)=>{v.rets=undefined})
        result[1].extra = JSON.parse(JSON.stringify(extra))
        context.current_date = result[0]
        results.push(result)
    }
    resultSetter({
      result:results.reverse(),
      condition:condition,
      title: ddFormat(new Date()).replace(/\//g, '') + '_' + new Date().valueOf()
    })
    setter(new_data_all)
  }
}

export default function BackTradeSyncSection(props:{data:CompanyInfoBlock[], setData:(data_all:CompanyInfoBlock[])=>void,  setResult:(result:BackTradeResult)=>void, context:typeof backTradeContext}) {  
  const syncLength = React.useMemo(()=>{
      return [
          props.data.filter((item)=>item.traded).length,
          props.data.length,
      ]
    }, [props.data])
  return (
    <View>
      <Button title={"Search!"} onPress={
              props.context.sync_lock==0?
              ()=>{backTrade(props.data, props.setData, props.setResult, 1, props.context)}:
              ()=>{}}/>
      <Text>({syncLength[0]}/{syncLength[1]})({props.context.current_date})</Text>
    </View>
  )
}
