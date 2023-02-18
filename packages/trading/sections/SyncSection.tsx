import * as React from 'react';
import { Text, View, Button, Platform } from 'react-native';
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load_stock_json, save_last_date, sleep, ddFormat, STORAGE_KEY, load_stock_json_bulk, LOAD_BULK_COUNT } from '../utils';
import { CompanyInfoBlock, CompanyResponse } from '../types';

const MAX_LOAD_STOCK = Platform.OS === 'web'?400:450
const MAX_RELOAD_STOCK = Platform.OS === 'web'?400:450
export const syncContext = {
    reload_stock:0,
    sync_lock:0,
    bulk_count:0,
}

export async function load_stock(data_all:CompanyInfoBlock[], endDate:Date, setter:(data_all:CompanyInfoBlock[])=>void, show_log:number, context:typeof syncContext){
  if (context.sync_lock == 0){
    let current_load_stock = 0
    context.sync_lock = 1
    context.reload_stock = 0
    context.bulk_count = 0
    data_all.forEach((item)=>{item.checked = false})
    let new_data_all: CompanyInfoBlock[] = data_all.map((item)=>item)
    setter(new_data_all)
    let _date = moment(endDate).add(1 - LOAD_BULK_COUNT, 'day').toDate()
    while(_date.valueOf()<= endDate.valueOf()){
      current_load_stock += 1
      load_stock_json_bulk(_date).then((data)=>{
        current_load_stock -= 1
        context.bulk_count += 1
      }).catch((e)=>{console.log('error: ', e)})
      _date = moment(_date).add(1, 'day').toDate()
    }
    while (current_load_stock > 0)
      await sleep(50)
    for (const [i, d] of data_all.entries()){
      let full_code = d.full_code
      context.reload_stock += 1
      while (context.sync_lock==2)
        await sleep(50)
      while (current_load_stock >= MAX_LOAD_STOCK || context.reload_stock>=MAX_RELOAD_STOCK){
          await sleep(50)
          if (context.reload_stock == MAX_RELOAD_STOCK){
              console.log('reload!!!!')
              new_data_all = data_all.map((item)=>item)  // array.slice(0)
              setter(new_data_all)
              await save_last_date(new_data_all)
          }
          else{
            context.reload_stock += 1
            console.log(current_load_stock, '/', MAX_LOAD_STOCK)
          }
      }
      current_load_stock += 1
      load_stock_json(full_code, {
        start_date:new Date(2016, 0, 1), end_date:endDate, log_datetime:0, isSimple:1
      }).then(async(j2:CompanyResponse)=>{
          if(show_log){  
            if (j2._status == 0){
              console.log(i, d)
              console.log(j2.output.length?j2.output[0] : null)
            }
            else{
              console.log(i, d.codeName, j2._status)
            }
          }
          data_all[i].checked = true
          data_all[i].lastDate = j2.output[0].TRD_DD || data_all[i].lastDate || ddFormat(endDate)
          current_load_stock -= 1
      })
    }
    while (current_load_stock > 0)
      await sleep(50)
    console.log('reload!!!!')
    new_data_all = data_all.map((item)=>item)
    context.sync_lock = 0
    setter(new_data_all)
    await save_last_date(new_data_all)
  }
}

export default (props:{data:CompanyInfoBlock[], setData:(data_all:CompanyInfoBlock[])=>void, context:typeof syncContext}) =>{
  const [lastDate, setLastDate] = React.useState<Date>(new Date())
  const setLastDateFull = React.useCallback((date:Date) =>{
    setLastDate(date)
    AsyncStorage.setItem(STORAGE_KEY['last_date'], ddFormat(date))
  }, [])
    const syncLength = React.useMemo(()=>{
        return [
            props.data.filter((item)=>(new Date(item.lastDate) >= lastDate)).length, 
            props.data.filter((item)=>item.checked).length,
            props.data.length
        ]
      }, [lastDate, props.data])

    React.useEffect(()=>{
      AsyncStorage.getItem(STORAGE_KEY['last_date']).then((value)=>{
        let date = value?new Date(value):lastDate
        setLastDateFull(date)
      })
    },[])
    return (
        <View>
          <View style={{flexDirection:'row'}}>
        <Text>Last Date: {ddFormat(lastDate)}</Text>
        <Button title={"down"} onPress={()=>{setLastDateFull(moment(lastDate).add(-1,'day').toDate())}}/>
        <Button title={"up"} onPress={()=>{setLastDateFull(moment(lastDate).add(1,'day').toDate())}}/>
      </View>
          <Button title={"Sync!"} onPress={
              props.context.sync_lock==0?
              ()=>{load_stock(props.data, lastDate, props.setData, 1, props.context)}:
              ()=>{}}/>
          <Text>({syncLength[0]}/{syncLength[2]})({props.context.bulk_count == LOAD_BULK_COUNT?syncLength[1]:'-'}/{syncLength[2]})</Text>
        </View>
    )
}