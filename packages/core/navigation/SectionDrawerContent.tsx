import * as React from 'react';
import { DrawerContentComponentProps, DrawerContentOptions, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View } from 'react-native';
export const NavigatorSections:Record<string, string[]> = {}

export default (props:DrawerContentComponentProps<DrawerContentOptions>) => {
    const originState = props.state;
    let index = originState.index;
    return<DrawerContentScrollView>
      {Object.keys(NavigatorSections).map((key)=>{
        const routes = originState.routes.filter((value)=>NavigatorSections[key].find((v)=>(v==value.name)))
        const state = Object.assign(Object.assign({}, originState), {routes, index});
        index -= routes.length
        return <View key={key} style={{marginVertical:'4%'}}><DrawerItemList key={key} {...props} state={state}/></View>
      })}
        
    </DrawerContentScrollView>
  };