import * as React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { DrawerParamList } from '@react-native-practice/core/types';
import { TouchableOpacity ,Text, View, FlatList, TextInput, ScrollView } from 'react-native';
import {load_stocklist_json} from '../utils';
import /*SyncSection,*/ { syncContext } from '../sections/SyncSection';
import Separator from '../components/Separator';
import { CompanyInfoBlock } from '../types';

export default function TabSearchScreen({
  navigation
}: StackScreenProps<typeof DrawerParamList, 'TabSearch'>) {
  const [data, setData] = React.useState<CompanyInfoBlock[]>([])
  const [dataSearch, setDataSearch] = React.useState<CompanyInfoBlock[]>([])
  const [keyword, setKeyword] = React.useState('')
  const searchRef = React.useRef<NodeJS.Timeout>()
  const renderItem = React.useCallback(({item, index}:{item:CompanyInfoBlock, index:number})=>{return (
    <View style={{flexDirection: 'row'}}>
      <TouchableOpacity onPress={()=>{navigation.navigate("Root", {
        screen: 'DetailScreen',
        params: {full_code: item.full_code}
      })}}>
        <Text>[{index + 1}]{item.short_code}:{item.codeName} </Text>
      </TouchableOpacity>
      <Text>({item.lastDate})</Text>
      <Text style={{color: item.checked !== undefined?(item.checked?'green':'orange'): 'red'}}>◉</Text>
    </View>
  )},[])
  const keyExtractor = React.useCallback((item:CompanyInfoBlock) => item.full_code, [])
  const onChangeText = React.useCallback((value)=>{
    setKeyword(value)
    if (searchRef.current)
      clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      setDataSearch(value != ''?data.filter((item)=>{return item.short_code.indexOf(value) > -1 || item.codeName.indexOf(value) > -1}):[])
    }, 200);
  }, [data])
  React.useEffect(()=>{
    console.log('reload finished')
    syncContext.reload_stock = 0
    if (data.length == 0){
        load_stocklist_json().then(
          (data_all)=>{
            //limited data
            //data_all.splice(10)
            //console.log(data_all)
            setData(data_all);
          }
        )
        }
        //setData([{full_code:11111},{full_code:11112},{full_code:11113},{full_code:11114},{full_code:11115}])
  },[data])
  return (
    <ScrollView>
      <TextInput style={{borderColor:'#000', borderWidth: 1, marginVertical: 30}} onChangeText={onChangeText} value={keyword}></TextInput>
      {/*<SyncSection data={data} setData={setData} context={syncContext}/>*/}
      <Separator/>
      <FlatList
        data={dataSearch}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={syncContext.sync_lock!=1?200:10}
      />
    </ScrollView>
  )
}
