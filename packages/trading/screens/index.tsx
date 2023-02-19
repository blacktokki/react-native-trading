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
            title: 'Search',
            url: ''
        },
        BackTradeScreen:{
            stacks: {defaultStack:BackTradeScreen},
            title: 'BackTrade',
            url: 'backtrade'
        },
        PortfolioScreen:{
            stacks: {defaultStack:PortfolioScreen},
            title: 'Portfolio',
            url: 'portfolio',
            params: {buys: 'asd', sells: 'asd'}
        },
        DetailScreen:{
            stacks: {defaultStack:DetailScreen},
            title: 'Detail',
            url: 'detail/:full_code',
            params: {full_code: 'asd'}
        },
        UtilScreen:{
            stacks: {defaultStack:UtilScreen},
            title: 'Util',
            url: 'util',
        },
    }
} as ScreenPackage
