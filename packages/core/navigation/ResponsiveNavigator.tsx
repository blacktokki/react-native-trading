

import { useNavigation, useNavigationState } from '@react-navigation/core';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigatorSections } from './SectionDrawerContent'
export const NavigatorsTitle:Record<string, string> = {}
export const tabBarHeight = 50

export const TabBarNavigation = ({data}:any)=>{
  const { colors } = useTheme();
  return <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: tabBarHeight,
          // paddingBottom,
          // paddingHorizontal: Math.max(insets.left, insets.right),
        },
        // tabBarStyle,
      ]}
      pointerEvents={false ? 'none' : 'auto'}
    >
      <View accessibilityRole="tablist" style={styles.content}>
        {data.map((d:any, index:any)=>{
          return (
          <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={d.isFocused ? { selected: true } : {}}
              onPress={d.navigate}
              style={styles.tab}
          >
              <Text style={[styles.label, { color: d.isFocused ? colors.primary : '#222' }]}>
              {d.label}
              </Text>
          </TouchableOpacity>
          );
      })}
      </View>
    </View>
}

type ResponsiveNavigatorContainerProps = {
  keys:string[],
  windowType?:'portrait' | 'landscape'
  ResponsiveNavigator?:(props:any)=>JSX.Element
}

export default ({ keys, ResponsiveNavigator, windowType }:ResponsiveNavigatorContainerProps)=> {
    const navigation = useNavigation()
    const state = useNavigationState(state=>state.routes[0].state)
    const currentScreen = state?.routes[state.index|| 0].name;
    const data = ([] as any[]).concat(...keys.map(screenKey=>NavigatorSections[screenKey].map(screen=>({
      label:NavigatorsTitle[screen],
      isFocused: currentScreen == screen,
      navigate: () => navigation.navigate("Root", {screen})
    }))))
    return windowType== "portrait" && ResponsiveNavigator?
      <View style={{position:'absolute', top:'100%', width:'100%', height:0, justifyContent:'flex-end'}}><ResponsiveNavigator data={data}/></View>:
      <></>
}

const styles = StyleSheet.create({
    tabBar: {
      left: 0,
      right: 0,
      bottom: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      elevation: 8,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        textAlign: 'center',
        backgroundColor: 'transparent',
      },
  });