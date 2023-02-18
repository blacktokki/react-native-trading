import { ScaleLinear } from "d3-scale";

type Aggregate = {
  values:number[], 
  zValues:number[],
  domain:[number, number],
  zDomain?:[number, number]
}

export type IndexType<T, C> = {
  CandleComponent: React.ComponentType<any>
  setData:(candle:Candle<C>, config:T) => void
  setValues:(prev:Aggregate, candle:Candle<C>) => void
  setDomains:(aggregate:Aggregate)=>void
  getVerticals?:(aggregate:Aggregate)=>number[]
}

export interface Candle<T> {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    volumeVal: number;
    prev?: Candle<T>;
    willChange?: number;
    extra?: T
}

export interface CandleProps<T> {
    candle: Candle<T>;
    index: number;
    width: number;
    scaleY: ScaleLinear<number, number>;
    scaleZ?: ScaleLinear<number, number>;
    scaleBody: ScaleLinear<number, number>;
}

export type Chart<T> = {
  height:number,
  chartIndex?:IndexType<any, any>,
  aggregate?:Aggregate,
  config?:T
}

type CommonProps = {
  candles:Candle<any>[], 
  width:number,
}

export type ChartProps = CommonProps & Chart<any>

export type HandlerProps = CommonProps & {
  charts: Chart<any>[],
  caliber:number, 
  rightWidth:number,
  candleRef: React.MutableRefObject<(candle: Candle<any>) => void>
  shiftRef: React.MutableRefObject<(shift: number) => void>
}

export type AsChartConfig<Type> = Type extends IndexType<infer T, infer C> ? T : never
export type AsCandleConfig<Type> = Type extends IndexType<infer T, infer C> ? C : never