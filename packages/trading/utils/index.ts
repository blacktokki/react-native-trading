import path from 'path'
import moment from 'moment'
import {load_json, save_json, exists_file, init_folder, file_list, delete_json} from './jsonio'
import {request_company, request_company_list, INDEX_INFO, request_company_all } from './requestutil'
import { CompanyInfoBlock, CompanyResponse, DailyFullModel, DailySimpleModel, CompanyResponseAll, CompanyBulk } from '../types'
import { saveCompress, loadCompress } from './compress'

export const INDEX_STOCK = ['ARIRANG', 'HANARO', 'KBSTAR', 'KINDEX', 'KODEX', 'TIGER', 'KOSEF', 'SMART', 'TREX', 'SOL', 'TIMEFOLIO']
export const FILE_SPLIT = 10
export const TRDVAL_DAYS = 20
export const MIN_TRDVAL = 2000000000
export const REPORT_OFFSET2 = 0.5
export const STORAGE_KEY = {
    'last_date': 'RNP_LAST_DATE',
    'condition': 'RNP_CONDITION',
    'portfolio': 'RNP_PORTFOLIO',
    'last_sync': 'RNP_LAST_SYNC'
}
export const LOAD_BULK_COUNT = 7

init_folder('data').then(()=>{
    init_folder(path.join('data', 'simple'))
    init_folder(path.join('data', 'stock'))
    init_folder(path.join('data', 'backtrade'))
    init_folder(path.join('data', 'portfolio'))
    init_folder(path.join('data', 'bulk')).then(()=>{
        file_list(path.join('data', 'bulk')).then((files)=>{
            const baseDate = moment(new Date()).add(-LOAD_BULK_COUNT, 'day').toDate()
            files.forEach((f)=>{
                if(baseDate.valueOf()> new Date(f.replace('.json', '')).valueOf()){
                    console.log('delete file ', f)
                    delete_file_json('bulk', f)
                }
            })
        })
    })
})

export function sleep(ms:number){
    return new Promise((r) => setTimeout(r, ms));
}

export async function load_stocklist_json(){
    const _path = path.join('data', 'list.json')
    if (await exists_file(_path)){
        var j = await load_json(_path)
    }
    else
        var j = await request_company_list() as any
        save_json(j, _path)
    //filtering stock!
    const data_all = (j['block1'] as CompanyInfoBlock[]).filter((d) =>{
        return ['KSQ', 'STK'].indexOf(d.marketCode) >= 0 && d.full_code[2] == '7' && d.full_code.substring(8, 11) == '000' && d.codeName.search('스팩') < 0 && ! is_index_stock(d.codeName)
    }).concat(INDEX_INFO)
    const _path2 = path.join('data', 'last_date.json')
    if (await exists_file(_path2)){
        const last_dates = await load_json(_path2)
        data_all.forEach((d)=>{
            d.lastDate = last_dates[d.full_code]
        })
    }
    else
        save_json({}, _path2)
    return data_all
}

const default_date = {
    start_date:new Date(2016, 0, 1), 
    end_date:moment(new Date()).set({h: 0, m: 0, s:0, ms:0}).toDate()
}

async function _save_stock(j2:CompanyResponse, _path:string, isSimple:number){
    if(!isSimple)
        await save_json(j2, _path)
    else
        await saveCompress(j2, _path, isSimple==2)
}

const bulk_cache:Record<string, CompanyBulk> = {}

export async function load_stock_json_bulk(date:Date){
    const dateStr = ddFormat(date)
    const now = new Date()
    let correctHours;
    if (dateStr == ddFormat(now) && now.getHours()<18){
        correctHours = now.getHours()
    }else if (date.valueOf()> now.valueOf()){
        correctHours = -1
    }
    console.log(date, correctHours)
    const _path = path.join('data', 'bulk', `${dateStr.replace(/\//gi,"-")}.json`)
    if (!bulk_cache[dateStr] || bulk_cache[dateStr].hours !== correctHours){
        let j:CompanyBulk|null=null;
        try{
            j = await load_json(_path) as CompanyBulk
            if(j?.hours !== correctHours)
                throw undefined
        }
        catch(e){
            const res:CompanyResponseAll = await request_company_all(date)
            const result:Record<string, DailySimpleModel> = {}
            res.OutBlock_1.forEach(value=>{
                value.TRD_DD = dateStr
                /*
                delete (value).CMPPREVDD_PRC
                delete (value).FLUC_TP_CD
                delete (value).ISU_ABBRV
                delete (value).LIST_SHRS
                delete (value).MKTCAP 
                delete (value).MKT_ID
                delete (value).MKT_NM
                delete (value).SECT_TP_NM
                */
                result[value.ISU_SRT_CD] = value
            })
            j = {
                output: result,
                hours: correctHours
            }
            save_json(j, _path)
        }
        bulk_cache[dateStr] = j
    }
    return bulk_cache[dateStr]
}

export async function load_stock_json(full_code:string, options?:{start_date:Date, end_date:Date, log_datetime:number, isSimple:number}){
    options = Object.assign({start_date:default_date.start_date, end_date:default_date.end_date, log_datetime:0}, options)
    let _path;
    if (options.isSimple==2)
        _path = full_code
    else{
        const folder = options.isSimple?'simple':'stock'
        _path = path.join('data', folder, full_code + '.json')
    }
    let success = true;
    let j2:CompanyResponse
    try{
        if(!options.isSimple)
            j2 = await load_json(_path)
        else
            j2 = await loadCompress(_path, options.isSimple==2)
    }catch(e){
        success = false;
        j2 = await request_company(full_code, default_date)
        _save_stock(j2, _path, options.isSimple)
        j2['_status'] = 0
        await sleep(200)
    }
    if (success){
        const output_len = j2['output'].length
        let last_date = output_len ? new Date(j2['output'][0]['TRD_DD']) : moment(options.start_date).add(1, 'day').toDate()
        if (options.log_datetime)
            console.log(options.start_date, last_date, options.end_date)
        if  (output_len == 0){
            j2 = await request_company(full_code, default_date) as any
            _save_stock(j2, _path, options.isSimple)
            j2['_status'] = 2
            await sleep(200)
        }
        else if (options.start_date.valueOf() < last_date.valueOf() && last_date.valueOf() <= options.end_date.valueOf()){
            let j3:CompanyResponse
            if (options.isSimple){
                let _date = last_date
                const output:DailySimpleModel[] = []
                const shortCode = full_code.slice(3, 9)
                while(_date.valueOf() <= options.end_date.valueOf()){
                    const cache = bulk_cache[ddFormat(_date)]
                    // console.log('@@', shortCode, cache?1:0, (cache || {})[shortCode])
                    if (!(cache && cache.output[shortCode])){
                        if (cache && cache.hours == -1){
                            _date = moment(_date).add(1, 'day').toDate()
                            continue
                        }
                        break
                    }
                    if (cache.output[shortCode].TDD_CLSPRC != '-')
                        output.push(cache.output[shortCode])
                    _date = moment(_date).add(1, 'day').toDate()
                }
                if (_date.valueOf() <= options.end_date.valueOf())
                    j3 = await request_company(full_code, {start_date:last_date, end_date:options.end_date})
                else{
                    // console.log('use bulk: ', full_code)
                    j3 = {
                        _status: 4,
                        output: output.reverse(),
                        CURRENT_DATETIME: j2['CURRENT_DATETIME']
                    }
                }
            }
            else
                j3 = await request_company(full_code, {start_date:last_date, end_date:options.end_date})
            j2['output'] = j3['output'].concat(j2['output'].slice(1))
            j2['CURRENT_DATETIME'] = j3['CURRENT_DATETIME']
            _save_stock(j2, _path, options.isSimple)
            if (j3['_status'] == 4)
                j2['_status'] = 4
            else{
                j2['_status'] = 3
                await sleep(200)
            }
        }
        else
            j2['_status'] = 1
    }
    return j2
}

export async function save_last_date(data_all:any[]){
    const last_dates:any = {}
    data_all.forEach((d)=>{
        last_dates[d['full_code']] = d['lastDate']
    })
    const _path2 = path.join('data', 'last_date.json')
    await save_json(last_dates, _path2)
}

export function is_index_stock(codename:string){
    for (let index_stock of INDEX_STOCK){
        if (codename.startsWith(index_stock))
            return true
    }
    return false
}

export async function save_file_json(dir:string, result:any){
    const _path = path.join('data', dir)
    if (result.title){
        await save_json(result, path.join(_path, `${result.title}.json`))
    }
}

export async function load_file_json(dir:string, filename?:string){
    const _path = path.join('data', dir)
    if(filename){
        return await load_json(path.join(_path, filename))
    }else{
        return await file_list(_path)
    }
}

export async function delete_file_json(dir:string, filename:string){
    const _path = path.join('data', dir, filename)
    await delete_json(_path)
}

export function trdval_filter(data:any, trdval_days:number, min_trdval:number){
    let trd_val_sum = 0
    let trd_val_cnt = 0
    for (let d of data['output']){
        trd_val_sum += parseInt((d as any)['ACC_TRDVAL'].replace(',',''))
        trd_val_cnt += 1
        if (trd_val_cnt == trdval_days)
            break
    }
    return trd_val_sum > min_trdval
}

export function ddFormat(date:Date){
    return date.getFullYear().toString() + '/' + (date.getMonth() + 1).toString().padStart(2,'0') + '/' + date.getDate().toString().padStart(2,'0')
}

export const ModelToCandle = (item:(DailySimpleModel | DailyFullModel))=>{
    const close = parseInt( item.TDD_CLSPRC.replace(/,/g, ''))
    return {
        "date": item.TRD_DD,
        "open":  item.TDD_OPNPRC!='0'?parseInt(item.TDD_OPNPRC.replace(/,/g, '')):close,
        "high": item.TDD_HGPRC!='0'?parseInt(item.TDD_HGPRC.replace(/,/g, '')):close,
        "low": item.TDD_LWPRC!='0'?parseInt(item.TDD_LWPRC.replace(/,/g, '')):close,
        "close":close,
        "volume":parseInt(item.ACC_TRDVOL.replace(/,/g, '')),
        "volumeVal":parseInt(item.ACC_TRDVAL.replace(/,/g, '')),
    }
}

export function avg_and_var(record2:Record<string, number>, length:number, lastDateStr:string){
    let j2_sum = 0.0
    let j2_pow_sum = 0.0
    let cnt = 0
    for(let date=moment(new Date(lastDateStr));cnt < length;date.add(-1, 'day')){
        const dateStr = ddFormat(date.toDate())
        const value2 = record2[dateStr]
        if(value2!=undefined){
            j2_sum += value2
            j2_pow_sum += value2 * value2
            cnt +=1
        }
        if (dateStr == '2016/01/01')break;
    }
    if (cnt && j2_sum != 0){
        let j2_avg = j2_sum/cnt
        let j2_var = j2_pow_sum/cnt - j2_avg * j2_avg
        return [j2_avg, j2_var]
    }
    return [null, null]
}

export function cov_and_var(record2:Record<string, number>, record3:Record<string, number>, length:number, lastDateStr:string){
    let j3_sum = 0.0
    let j3_pow_sum = 0.0
    let j2_sum = 0.0
    let j2_pow_sum = 0.0
    let cov_sum = 0.0
    let cov_cnt = 0

    for(let date=moment(new Date(lastDateStr));cov_cnt < length;date.add(-1, 'day')){
        const dateStr = ddFormat(date.toDate())
        const value2 = record2[dateStr], value3 = record3[dateStr]
        if(value2!=undefined && value3!=undefined){
            j2_sum += value2
            j2_pow_sum += value2 * value2
            j3_sum += value3
            j3_pow_sum += value3 * value3
            cov_sum += value2 * value3
            cov_cnt += 1
        }
        if (dateStr == '2016/01/01')break;
    }
    if (cov_cnt && j2_sum != 0 && j3_sum != 0){
        let j2_avg = j2_sum/cov_cnt
        let j3_avg = j3_sum/cov_cnt
        let cov = (cov_sum/cov_cnt) - j3_avg * j2_avg
        let j2_var = j2_pow_sum/cov_cnt - j2_avg * j2_avg
        let j3_var = j3_pow_sum/cov_cnt - j3_avg * j3_avg
        return [cov, j2_var, j3_var]
    }
    return [null, null, null]
}