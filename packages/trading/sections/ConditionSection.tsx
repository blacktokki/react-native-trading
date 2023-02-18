import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, TextInput } from 'react-native';
import { STORAGE_KEY } from '../utils';
import { Button } from 'react-native';
const defaultCondition = {
  "config": {
      "hloc": {
          "bollingers": [
              {
                  "fill": "green",
                  "count": 20,
                  "exp": 2
              }
          ]
      },
      "volume": {
          "mas": [
              20
          ]
      },
      "mfi": {
          "depth": 10
      },
      "ii": {
          "depth": 21
      },
      "bolmfiii": {
          "maxHold": 40,
          "bolingerIndex": 0,
          "minTradeDays": 40,
          "yieldRatio": 0,
          "stdevRatio": 2.5
      }
  }
}

export default function ConditionSection(props:{}) {
    const [condition, setCondition] = React.useState<string>('{}')
    const [size, setSize] = React.useState<{height:number|undefined}>({height:undefined});
    const setConditionFull = React.useCallback((cond:string) =>{
        setCondition(cond)
        AsyncStorage.setItem(STORAGE_KEY['condition'], cond)
      }, [])
    React.useEffect(()=>{
        AsyncStorage.getItem(STORAGE_KEY['condition']).then((value)=>{
            setConditionFull(value?value:condition)
        })
    })
    return (
    <View>
       <TextInput 
        style={[{borderColor:'#000', borderWidth: 1, margin: 10, padding:5}, {height:size.height}]} 
        multiline
        onChangeText={setConditionFull} 
        value={condition}
        onContentSizeChange={(e)=>{
            if (Math.abs(e.nativeEvent.contentSize.height - (size.height || 0)) > 5)
                setSize(e.nativeEvent.contentSize)
        }}
     />
     <Button title={'reset'} onPress={()=>{setConditionFull(JSON.stringify(defaultCondition, null, 4))}}/>
     <Button title={'format'} onPress={()=>{setConditionFull(JSON.stringify(JSON.parse(condition), null, 4))}}/>
    </View>
  )
}
