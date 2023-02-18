import UtilScreen from './UtilScreen'
import SearchScreen from './SearchScreen'
import DetailScreen from './DetailScreen'
import BackTradeScreen from './BackTradeScreen'
import PortfolioScreen from './PortfolioScreen'
import { ScreenPackage } from '@react-native-practice/core/types'
export default {
    key:'trading',
    screens:{
        SearchScreen:{
            stacks: {defaultStack:SearchScreen},
            title: 'Tab Search Title',
            url: ''
        },
        BackTradeScreen:{
            stacks: {defaultStack:BackTradeScreen},
            title: 'Tab BackTrade Title',
            url: 'backtrade'
        },
        PortfolioScreen:{
            stacks: {defaultStack:PortfolioScreen},
            title: 'Tab Portfolio Title',
            url: 'portfolio',
            params: {buys: 'asd', sells: 'asd'}
        },
        DetailScreen:{
            stacks: {defaultStack:DetailScreen},
            title: 'Tab Detail Title',
            url: 'detail/:full_code',
            params: {full_code: 'asd'}
        },
        UtilScreen:{
            stacks: {defaultStack:UtilScreen},
            title: 'Tab Util Title',
            url: 'util',
        },
    }
} as ScreenPackage
