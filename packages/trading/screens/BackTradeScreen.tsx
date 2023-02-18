import * as React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { DrawerParamList } from '@react-native-practice/core/types';
import { TouchableOpacity ,Text, View, FlatList, TextInput, Button, ScrollView } from 'react-native';
import ConditionSection from '../sections/ConditionSection';
import BackTradeSyncSection, {backTradeContext, BackTradeResult, BackTradeRow} from '../sections/BackTradeSyncSection';
import { load_stocklist_json} from '../utils';
import { useHeaderHeight } from '@react-navigation/stack';
import Separator from '../components/Separator';
import { CompanyInfoBlock } from '../types';
import BackTradeDetailSection, {Popup} from '../sections/BackTradeDetailSection';
import FileManagerSection from '../sections/FileManagerSection';

export default function TabBackTradeScreen({
  navigation
}: StackScreenProps<typeof DrawerParamList, 'TabBackTrade'>) {
  const [data, setData] = React.useState<CompanyInfoBlock[]>([])
  const [result, setResult] = React.useState< BackTradeResult>({})
  const [year, setYear] = React.useState(new Date().getFullYear())
  const [popup, setPopup] = React.useState<Popup>({})
  const screenHeight = useHeaderHeight()
  const scrollOffsetRef = React.useRef(0)
  const resultYear = React.useMemo(()=>{
    return result.result?.filter((value)=>{return value[0].startsWith(year.toString())})
  }, [result, year])
  const resultRow = React.useMemo(()=>{return (popup.idx!=undefined && resultYear)?resultYear[popup.idx]:undefined}, [resultYear, popup])
  const renderItem = React.useCallback(({item, index}:{item:BackTradeRow, index:number})=>{
    return (<TouchableOpacity onPress={(e)=>{setPopup({
      x:e.nativeEvent.pageX,
      y:e.nativeEvent.pageY - screenHeight + scrollOffsetRef.current,
      idx:index
    })}}>
      <Text>{item[0]} cash:{item[1].cash} earn:{item[1].earn}</Text>
    </TouchableOpacity>)
  }, [screenHeight, scrollOffsetRef.current])
  const onScroll = React.useCallback((e)=>{scrollOffsetRef.current = e.nativeEvent.contentOffset.y}, [])
  React.useEffect(()=>{
    console.log('reload finished')
    backTradeContext.reload_stock = 0
    if (data.length == 0){
      load_stocklist_json().then((_data)=>{setData(_data.filter(d=>['_KOSDAQ', '_KOSPI'].indexOf(d.full_code) < 0))})
    }
  },[data])
  return (
    <ScrollView onScroll={onScroll}>
      <View style={{flexDirection:'row'}}>
        <FileManagerSection
          style={{flexDirection:'column', flex:0.5}}
          dir={'backtrade'}
          data={result}
          defaultData={{}}
          setData={setResult}
        />
        <View style={{flex:0.5}}>
          <ConditionSection/>
          <BackTradeSyncSection data={data} setData={setData} setResult={setResult} context={backTradeContext}/>
        </View>
      </View>
      <Separator/>
      <View style={{flexDirection:'row'}}>
        <Button title={'prev'} onPress={()=>{setYear(year-1)}}/>
        <Text>{year}</Text>
        <Button title={'next'} onPress={()=>{setYear(year+1)}}/>
      </View>
      <FlatList
        scrollEnabled={false}
        data={resultYear}
        renderItem={renderItem}
      />
      <BackTradeDetailSection
          navigation={navigation}
          popup={popup}
          resultRow={resultRow}
          setPopup={setPopup}
      />
    </ScrollView>
  )
}
