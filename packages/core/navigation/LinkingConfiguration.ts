/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { PathConfigMap } from '@react-navigation/core';
import * as Linking from 'expo-linking';
import { ScreenPackage, StackPackage } from '../types'

const screens:PathConfigMap = {} 
export function pushPathConfig(currentValue:ScreenPackage){
  Object.keys(currentValue.screens).reduce((_previousValue, _currentValue)=>{
    const screen = currentValue.screens[_currentValue]
    const _stacks:PathConfigMap = {}
    for (var k in screen.stacks){
      _stacks[k] = (screen.stacks[k] as StackPackage).url || ''
    }
    _previousValue[_currentValue] = { screens:_stacks, path: screen.url}
    return _previousValue
  }, screens)
}

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        path: "",
        screens: screens
      },
      NotFound: '*',
    },
  },
};
