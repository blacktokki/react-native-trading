
import * as React from 'react';
import { avg_and_var, cov_and_var, ddFormat } from '../utils';
import { Candle } from '../components/chart/CandleType';
import { CompanyInfoBlock, CompanyInfoHold } from '../types';
import useResizeWindows from  '@react-native-practice/core/hooks/useResizeWindow';
import Plot from '../components/chart/Plot';


export type FronTierPrice = {
    candles:Candle<any>[],
    rets:Record<string, number>,
    price:number
    avgRatio:number|null,
    corrs?:Record<string, number>,
}

type FronTierInput = {
    holds:(CompanyInfoHold & FronTierPrice)[], 
    buys:(CompanyInfoBlock & FronTierPrice)[], 
    config: {covDate:number, totalCash:number, maxHolds:number}
}

type FronTierOutput = {
    stocks:Record<string, number>,
    ret:number,
    lisk:number
}

const frontier=({holds, buys, config}:FronTierInput)=>{
    const willHold = holds.concat(buys as any)
    willHold.forEach((v)=>{
        v.corrs = {}
        v.avgRatio = avg_and_var(v.rets, config.covDate, ddFormat(new Date()))[0]
    })
    willHold.forEach((v2)=>{
        willHold.forEach((v3)=>{
                const cv = cov_and_var(v2.rets, v3.rets, config.covDate, ddFormat(new Date()))
                if(cv[0]&&cv[1]&&cv[2] && v2.corrs){
                    v2.corrs[v3.full_code] = cv[0]/Math.sqrt(cv[1] * cv[2])
            }
        })
    })
    
    const resultSets:FronTierOutput[] = []
    for(let i=0;i<30000;i++){
        let ratioCount = 0
        const ratios = holds.reduce((prev, v)=>{
            const ratio = (v.count || 0) * v.price / config.totalCash
            ratioCount += ratio
            prev[v.full_code] = ratio
            return prev
        }, {} as Record<string, number>)
        const localBuys = buys.slice(0)
        while(localBuys.length + Object.keys(ratios).length > config.maxHolds){
            localBuys.splice(Math.floor(Math.random() * localBuys.length), 1)
        }
        localBuys.forEach((v, j)=>{
            let r= v.price / config.totalCash
            ratioCount += r
            ratios[v.full_code] = r
            r = (1 - ratioCount) * (j==localBuys.length -1?1:Math.random())
            ratioCount += r
            ratios[v.full_code] += r
        })

        resultSets.push({
            stocks:ratios,
            ret:config.covDate * willHold.reduce((prev, v)=>{prev += (v.avgRatio||0) * (ratios[v.full_code] || 0); return prev}, 0),
            lisk:willHold.reduce((prev, v)=>{
                prev += willHold.reduce((prev2, v2)=>{
                    const value = v.corrs
                    prev2 += (value?value[v2.full_code]:0 || 0) * (ratios[v2.full_code] || 0)
                    return prev2
                }, 0) * (ratios[v.full_code] || 0)
                return prev
            }, 0)
        })
    }
    return resultSets.sort((a, b)=>a.lisk&&b.lisk?(a.ret/a.lisk<b.ret/b.lisk?1:-1):0)
}

export type FrontierFunction = typeof frontier

export default ({frontierRef}:{frontierRef:React.MutableRefObject<FrontierFunction|undefined>})=>{
    const [output, setOutput] = React.useState<FronTierOutput[]>([])
    const [plot, setPlot] = React.useState({
        data:[] as {fill:string, avg:number, std:number}[],
        domainX: [0, 0] as [number, number],
        domainY: [0, 0] as [number, number]
    })
    frontierRef.current = (input: FronTierInput) => {
        const result = frontier(input)
        setOutput(result)
        const data = result.map(v=>({fill:'orange', avg:v.ret, std:v.lisk})).slice(0, result.length/100)
        const avgOnly = data.map((v)=>v.avg)
        const stdOnly = data.map((v)=>v.std)
        const mins = data.length?Math.min(...stdOnly, ...avgOnly):0
        const maxs = data.length?Math.max(...stdOnly, ...avgOnly):0
        setPlot({
            data:data,
            domainX: [mins -0.1, maxs + 0.2],
            domainY: [mins -0.1, maxs + 0.2]
        })
        return result
    }
    const window = useResizeWindows()
    return <Plot size={[window.width * 0.5, window.width * 0.5]} {...plot} showText={false} r={2}/>
}