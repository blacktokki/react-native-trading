import * as React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { DrawerParamList } from '@react-native-practice/core/types';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import SectionDummy from '@react-native-practice/core/components/SectionDummy'
import SliderSection from '../sections/SliderSection'
import DraggableFlatListMain from '@react-native-practice/core/components/DraggableFlatListMain'
import { cdf, laplace_cdf } from '../utils/mathutil'

export default function TabUtilScreen({
  navigation
}: StackScreenProps<typeof DrawerParamList, 'TabMain'>) {
  return (
    <DraggableFlatListMain
      header={[
        <Text style={styles.Panel_Button_Text}>{'Tab Two 1'} </Text>,
        <Text style={styles.Panel_Button_Text}>{'Tab Two 2'} </Text>,
        <Text style={styles.Panel_Button_Text}>{'Tab Two 4'} </Text>
      ]}
      dataCallback={()=>{}}
      holderStyle={styles.Panel_Holder}
      sortEnabled={false}
    >
      <SliderSection renderText={(text)=>{return cdf(parseFloat(text) || 0.0).toString()}}/>
      <SliderSection renderText={(text)=>{return laplace_cdf(parseFloat(text) || 0.0).toString()}}/>
    </DraggableFlatListMain>
  )
}

const styles = StyleSheet.create({
  Panel_text: {
    fontSize: 18,
    color: '#000',
    padding: 10
  },
  Panel_Button_Text: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 21
  },
  Panel_Holder: {
    borderWidth: 1,
    borderColor: '#888',
    marginVertical: 5
  }
})
