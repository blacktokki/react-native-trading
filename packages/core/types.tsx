/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

export type RootStackParamList = {
  Root: undefined;
  NotFound: undefined;
};
export type StackPackage = {
  title?: string,
  component: React.ComponentType<any>,
  url?: string| Record<string, any>,
  params?: Record<string, any>,
}

export type ScreenPackage = {
  key:string,
  screens:Record<string, {
    url:string,
    title: string,
    params?: Record<string, any>
    useDrawer?: boolean,
    stacks:Record<string, StackPackage | React.ComponentType<any>>
  }>
}

export const DrawerParamList:Record<string, Record<string, any> | undefined> = {}