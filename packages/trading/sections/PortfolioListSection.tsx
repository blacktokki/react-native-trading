import * as React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { CompanyInfoBlock, CompanyInfoHold } from "../types";
import { FronTierPrice } from './FrontierSection';

type SectionParamList = {
    style?:ViewStyle
    items:(CompanyInfoHold | CompanyInfoBlock)[],  
    mode:'buys'|'sells', 
    setCompanyMode:(mode:'buys'|'sells')=>void,
    setCompanyCode:(code:string)=>void,
    setCompanyPrice:(price:number)=>void,
    setCompanyRatio:(ratio:number)=>void,
    priceRecord:Record<string, FronTierPrice>
}

export default React.memo(({style, items, mode, setCompanyMode, setCompanyCode, setCompanyPrice, setCompanyRatio, priceRecord}:SectionParamList)=>{
    return <View style={style}>
        {items.map((item, index)=>{
            const _item = (item as CompanyInfoHold)
            return <TouchableOpacity
                style={{paddingVertical:3}} 
                key={index} 
                onPress={()=>{setCompanyMode(mode);setCompanyCode(item.full_code);setCompanyPrice(priceRecord[item.full_code].price);setCompanyRatio(0)}}
            >
                <Text>{item.full_code}:{item.codeName}:{priceRecord[item.full_code].price}원 {_item.price?`(${_item.price}원)`:''}</Text>
                {_item.count && _item.price?<Text>{_item.count}주 {priceRecord[item.full_code].price * _item.count}원 ({_item.price * _item.count}원)</Text>:undefined}
                {_item.lowRatio!=undefined && _item.highRatio!=undefined?<Text>{((1 + _item.lowRatio/100) * priceRecord[item.full_code].price).toFixed(0)}원 ~ {((1 + _item.highRatio/100) * priceRecord[item.full_code].price).toFixed(0)}원({_item.lowRatio}% ~{_item.highRatio}%)</Text>:undefined}
            </TouchableOpacity>
        })}
    </View>
})