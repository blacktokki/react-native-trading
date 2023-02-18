import * as React from 'react';
import { Text, View } from '@react-native-practice/core/components/Themed';
import { StyleSheet, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
type SectionParamList = {
    renderText?:(text:string)=>string
}

export default function SectionDummy(props:SectionParamList){
    const [value, setValue] = React.useState('Useless Multiline Placeholder');
    const [size, setSize] = React.useState<{height:number|undefined}>({height:undefined});
    const onChangeText = (text:string) => {setValue(text)}
    return (
    <View style={styles.commonContainer}>
        <View>
            <TextInput
                multiline
                onChangeText={text => onChangeText(text)}
                value={value}
                style={[styles.commonText, {width:'50%', height:size.height}]}
                onContentSizeChange={(e)=>{setSize(e.nativeEvent.contentSize)}}
            />
            <Slider 
                minimumValue={-6}
                maximumValue={6}
                value={parseFloat(value)|| 0}
                onValueChange={(value)=>setValue(value.toString())}
            />
        </View>
        <Text
        style={styles.commonText}
        lightColor="rgba(0,0,0,0.8)"
        darkColor="rgba(255,255,255,0.8)">
            {props.renderText?props.renderText(value):value}
        </Text>
  </View>
    )
}

const styles = StyleSheet.create({
    commonContainer: {
        minWidth: 400,
        alignItems: 'center',
        marginHorizontal: 50,
        flexDirection:'row'
      },
      commonText: {
        fontSize: 17,
        lineHeight: 24,
        textAlign: 'center',
      }
  });
