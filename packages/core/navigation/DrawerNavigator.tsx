/**
 * Learn more about createDrawerNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { DrawerScreenProps, createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Text, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import useResizeWindow from '../hooks/useResizeWindow';
import { DrawerParamList, ScreenPackage, StackPackage } from '../types'
import Config from './Config'
import SectionDrawerContent, {NavigatorSections} from './SectionDrawerContent';
import ResponsiveNavigator, {NavigatorsTitle, tabBarHeight, TabBarNavigation} from './ResponsiveNavigator';

const drawerWidth = 240
const Drawer = createDrawerNavigator<typeof DrawerParamList>();
const Navigators:Record<string, JSX.Element[]> = {}

export function pushNavigators(currentValue:ScreenPackage){
  const keys = Object.keys(currentValue.screens)
  NavigatorSections[currentValue.key] = keys
  Navigators[currentValue.key] = keys.map((value)=>{
    NavigatorsTitle[value] = currentValue.screens[value].title
    return DrawerNavigatorGeneric(
      value, 
      currentValue.screens[value].title, 
      currentValue.screens[value].useDrawer != false,
      currentValue.screens[value].params || {},
      currentValue.screens[value].stacks
    )})
}

let initScreenKeys:string[]|undefined
const defaultScreenKeys = {
  set: (keys:string[], screen?:string)=>{initScreenKeys = keys;Config.initialRouteName = screen},
  get: ()=>{return initScreenKeys || [Object.keys(Navigators)[0]]}
}

export const screenKeys = Object.assign({}, defaultScreenKeys)

export default function DrawerNavigator() {
  const windowType = Config.ResponsiveNavigator?useResizeWindow():undefined
  const drawerType = Config.ResponsiveNavigator?'permanent':undefined
  const drawerStyle = Config.ResponsiveNavigator?{maxWidth:windowType=='portrait'?0:drawerWidth}:undefined
  const [keys, setKeys] = React.useState(screenKeys.get());
  const colorScheme = useColorScheme();
  React.useEffect(()=>{
    screenKeys.get = () => {return keys}
    screenKeys.set = (keys, screen)=> {setKeys(keys);Config.initialRouteName = screen}
    return ()=>{Object.assign({}, defaultScreenKeys)}
  }, [keys])

  return (
    <>
      <Drawer.Navigator
          initialRouteName={Config.initialRouteName as keyof typeof DrawerParamList}
          screenOptions={{unmountOnBlur:true}}
          drawerContent={SectionDrawerContent}
          drawerContentOptions={{activeTintColor: Colors[colorScheme].tint}}
          drawerType={drawerType}
          drawerStyle={drawerStyle}
        >
          { keys.map((value)=>Navigators[value]) }
        </Drawer.Navigator>
        <ResponsiveNavigator keys={keys} ResponsiveNavigator={Config.ResponsiveNavigator} windowType={windowType}/>
    </>
  );
}

function DrawerNavigatorGeneric(name:string, title:string, useDrawer:boolean, params:Record<string, any>, stacks:Record<string, StackPackage | React.ComponentType<any>>){
  //const drawerName = name.substring(0, name.lastIndexOf("Screen"))
  DrawerParamList[name] = params
  return (
    <Drawer.Screen
      key={name}
      name={name}
      component={StackNavigatorGeneric(name, title, useDrawer, params, stacks)}
      options={{
        title:title,
        // drawerLabel: (props)=><></>,
        drawerIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
      }}
    />
  )
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
function StackNavigatorGeneric<RouteName extends keyof typeof DrawerParamList>(name:string, title:string, useDrawer:boolean, params:Record<string, any>, stacks:Record<string, StackPackage | React.ComponentType<any>>){
  const ParamList:Record<string, object | undefined> = {}
  const TabStack = createStackNavigator<typeof ParamList>();
  function TabNavigator({navigation}: DrawerScreenProps<typeof DrawerParamList, RouteName>) {
    const windowType = Config.ResponsiveNavigator?useResizeWindow():undefined
    if(!useDrawer || Config.ResponsiveNavigator)
      navigation.closeDrawer()
    return (
      <ScrollView contentContainerStyle={{flex:1}}>
      <TabStack.Navigator>
        {Object.keys(stacks).map((value, index)=>{
          const stack = stacks[value] as StackPackage
          ParamList[value || name] = stack.params || params
          return <TabStack.Screen
          key={index}
          name={value || name}
          component={stack.component || stack}
          options={(option)=>({
            headerTitle: stack.title || title,
            cardStyle: {overflow:'visible', marginBottom:windowType=='portrait'?tabBarHeight:undefined},
            headerLeft: (props) => (
                useDrawer && Config.ResponsiveNavigator == undefined?<TouchableOpacity 
                  onPress={() => navigation.openDrawer()} 
                  style={{marginLeft:20, borderRadius:6, borderColor:'rgba(27,31,36,0.15)', borderWidth:1, paddingVertical:5, paddingHorizontal:6.5, width:32}}>
                    <FontAwesome size={20} name='bars' color='black' />
                    {/* <Text style={{color:'black', textAlign:'center', fontSize:14, fontWeight:'400'}}>메뉴</Text> */}
                  </TouchableOpacity>:undefined
            ),
            ...Config.screenOptions,
          })}
        />
        })}
      </TabStack.Navigator>
      </ScrollView>
    );
  }
  return TabNavigator
}

Config.ResponsiveNavigator = TabBarNavigation