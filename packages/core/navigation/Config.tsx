import { StackNavigationOptions } from "@react-navigation/stack"
import { ComponentType } from "react"
import { ResponsiveNavigatorProps } from "../types"

const Constants:{
    initialRouteName?:string,
    ResponsiveNavigator?:(props:ResponsiveNavigatorProps)=>JSX.Element
    notFoundScreen:{
        component: ComponentType<any>,
        title: string,
    },
    rootPath: string,  //github repository name,
    screenOptions: StackNavigationOptions
} = {
    initialRouteName:undefined,
    notFoundScreen: require('../screens').default.screens.NotFoundScreen,
    rootPath: '/react-native-practice',
    screenOptions:{}
}
export default Constants