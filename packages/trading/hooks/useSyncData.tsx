// import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import moment from 'moment'
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { load_stock, syncContext } from '../sections/SyncSection';
import { CompanyInfoBlock } from '../types';
import { load_stocklist_json, LOAD_BULK_COUNT, STORAGE_KEY } from '../utils';

export default function useSyncData() {
  const [isSyncComplete, setSyncComplete] = React.useState(false);
  const [data, setData] = React.useState<CompanyInfoBlock[]>([])
  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY['last_sync']).then((last_sync)=>{
      const now = new Date()
      if (parseInt((last_sync || '0'), 10) + 1000 * 900 < now.valueOf()){
        load_stocklist_json().then((data_all)=>{
          setData(data_all);
          load_stock(data_all, moment(new Date()).set({h: 0, m: 0, s:0, ms:0}).toDate(), setData, 1, syncContext).then(()=>{
            setSyncComplete(true);
            AsyncStorage.setItem(STORAGE_KEY['last_sync'], now.valueOf().toString())
          })
        })
      }
      else
        setSyncComplete(true);
    })
  }, []);
  React.useEffect(()=>{
    console.log('reload finished')
    syncContext.reload_stock = 0
  }, [data])
  const syncRender = React.useMemo(()=>{
    const syncLength = [
      data.filter((item)=>item.checked).length,
      data.length
    ]
    return (<View style={{left:'50%', top:'50%', alignContent:'center'}}>
      <Text>({syncContext.bulk_count == LOAD_BULK_COUNT?syncLength[0]:'-'}/{syncLength[1]})</Text>
    </View>)
  }, [data])
  return [isSyncComplete, syncRender];
}
