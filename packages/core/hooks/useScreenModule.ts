import { useEffect } from "react"
import { pushNavigators, screenKeys } from "../navigation/DrawerNavigator"
import { pushPathConfig } from "../navigation/LinkingConfiguration"
import { ScreenPackage } from "../types"

export default (screenPackages:ScreenPackage[], screenKeyList?:string[])=>{
  useEffect(()=>{
    screenPackages.forEach(screens=>{
      pushNavigators(screens)
      pushPathConfig(screens)
    })
    screenKeyList && screenKeys.set(screenKeyList)
  }, [])
}