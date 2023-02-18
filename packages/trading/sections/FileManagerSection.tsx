import * as React from 'react';
import { View, ViewStyle, Text, FlatList, TouchableOpacity, Button } from 'react-native';
import { delete_file_json, load_file_json, save_file_json } from '../utils';
type SectionParamList = {
    style:ViewStyle,
    dir:string,
    data:any,
    defaultData:any,
    setData:(data:any)=>void
}

export default function FileManagerSection(props:SectionParamList){
    const [fileList, setFileList] = React.useState<string[]|undefined>()
    const reload = React.useCallback(()=>load_file_json(props.dir).then(setFileList), [props.dir])
    const renderFile = React.useCallback(({item}:{item:string})=>{
        return (
          <View style={{flexDirection:'row', maxWidth:'70%'}}>
            <TouchableOpacity onPress={()=>{props.setData(props.defaultData);load_file_json(props.dir, item).then((data)=>{props.setData(data)})}}>
              <Text>{item}</Text>
            </TouchableOpacity>
            <View style={{minWidth:30}}>
              <Button title={'X'} onPress={()=>{delete_file_json(props.dir, item).then(reload)}}/>
            </View>
          </View>)
        }, [])
    React.useEffect(()=>{
        if(fileList==undefined)
            reload()
    },[fileList])
    return (
        <View style={props.style}>
            <FlatList
            style={{borderColor:'#000', borderWidth: 1, margin: 10, padding:5}}
            data={fileList||[]}
            renderItem={renderFile}
            scrollEnabled={false}
            />
            <Button
            title={'save'}
            onPress={()=>{save_file_json(props.dir, props.data).then(reload)}}
            />
        </View>
    )
}
