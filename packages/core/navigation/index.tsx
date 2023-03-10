/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */

import { NavigationContainer, DefaultTheme, DarkTheme, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import { RootStackParamList } from '../types';
import DrawerNavigator from './DrawerNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import Config from './Config'

const navigationRef = React.createRef<NavigationContainerRef>();

export function navigate(name:string, params?:any) {
  if (params)
    navigationRef.current?.navigate(name, params);
  navigationRef.current?.navigate(name);
}

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  LinkingConfiguration.config.screens.Root.path = Config.rootPath
  return (
    <NavigationContainer
      ref={navigationRef}
      documentTitle={{formatter: (options, route) => {return `${options?.headerTitle || route?.name} - My App`}}}
      linking={(process.versions && process.versions['electron'])?undefined:LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Root" component={DrawerNavigator} />
      <Stack.Screen name="NotFound" component={Config.notFoundScreen.component} options={{ title: Config.notFoundScreen.title }} />
    </Stack.Navigator>
  );
}
