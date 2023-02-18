  
import path from 'path'
import * as fs from 'expo-file-system';

function joinDefaultPath(_path:string){
    return fs.documentDirectory?path.join(fs.documentDirectory, _path):_path
}

export async function save_json(data:any, _path:string){
    await fs.writeAsStringAsync(joinDefaultPath(_path), JSON.stringify(data), {encoding:"utf8"});
}

export async function load_json(_path:string){
    let data = await fs.readAsStringAsync(joinDefaultPath(_path), {encoding:'utf8'})
    return JSON.parse(data)
}

export async function delete_json(_path:string){
    await fs.deleteAsync(joinDefaultPath(_path))
}


export async function exists_file(_path:string){
    return (await fs.getInfoAsync(joinDefaultPath(_path))).exists
}

export async function init_folder(_path:string){
    if(!await exists_file(_path)){
        await fs.makeDirectoryAsync(joinDefaultPath(_path), { intermediates: true });
    }
}

export async function file_list(_path:string){
    return await fs.readDirectoryAsync(joinDefaultPath(_path))
}