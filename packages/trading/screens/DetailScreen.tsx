import * as React from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Button, Platform, useWindowDimensions } from 'react-native';
import * as Linking from 'expo-linking';
import { StackScreenProps } from '@react-navigation/stack';
import { DrawerParamList } from '@react-native-practice/core/types';
import useResizeWindows from  '@react-native-practice/core/hooks/useResizeWindow';
import { CompanyResponse } from '../types';
import { load_stock_json, ModelToCandle } from '../utils';
import CoinBasePro from '../sections/ChartSection';

export default function TabDetailScreen({
    navigation, route
}: StackScreenProps<typeof DrawerParamList, 'TabDetail'>) {
    const [fullCode, setFullCode] = React.useState()
    const [data, setData] = React.useState<CompanyResponse>()
    const window =  useWindowDimensions()
    const CoinData = React.useMemo(()=>data?data.output.map(ModelToCandle).reverse():[], [data])
    const shortCode = React.useMemo(()=>(fullCode || '').slice(3,9), [fullCode])
    const stockPlusUrl = React.useMemo(()=>'stockplus://viewStock?code=A'+ shortCode + '&tabIndex=0&marketIndex=0', [shortCode])
    let nextFullCode = route.params?.full_code || '_KOSPI'
    if (fullCode != nextFullCode){
        load_stock_json(nextFullCode).then((_data)=>{
            setFullCode(nextFullCode)
            setData(_data)
        })
    }
    return (
    <ScrollView>
        <Text>{fullCode}</Text>
        <CoinBasePro data={CoinData} width={window.width}/>
        {Platform.OS == 'android' && shortCode && shortCode.length > 5 ?(
            <Button title={shortCode} onPress={()=>{Linking.openURL(stockPlusUrl)}}></Button>
        ):undefined}
    </ScrollView>)
}