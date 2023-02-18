import * as React from 'react';
import { Text, View } from './Themed';
import { StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import EditScreenInfo from './EditScreenInfo';

type SectionDummyParamList = {
    title: string,
    pressText1: string,
    onPress1:(event: GestureResponderEvent)=>void,
    path: string
}

export default function SectionDummy(props:SectionDummyParamList){
  return (
        <View style={styles.container}>
            <TouchableOpacity onPress={props.onPress1} style={styles.link}>
            <Text style={styles.linkText}>{props.pressText1}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{props.title}</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <EditScreenInfo path={props.path} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: '80%',
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
    linkText: {
      fontSize: 14,
      color: '#2e78b7',
    },
  });
  