import React ,{ useState, useCallback, useEffect, RefObject } from "react";
import { View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { default as _DraggableFlatList, RenderItemParams as _RenderItemParams, DragEndParams } from "react-native-draggable-flatlist";

export type RenderItemParams<T> = _RenderItemParams<T>
export type CommandSetterParams<T> = {
  getData:()=>T[], add:(newData:T, index:any)=>void, remove:(index:any)=>T, shift:(newIndex:any, oldIndex:any)=>void
}
type Props<T> = {
  data:T[],
  dataCallback:(data:T[])=>void,
  scrollEnabled?:boolean,
  sortEnabled:boolean,
  renderItem:(params:RenderItemParams<T>)=>React.ReactNode,
  height:number,
  keyExtractor:(item:T, index:number)=>string,
  scrollDelay?: number,
  updateBeforeSortStart?: ()=> void
  horizontal: boolean | null | undefined
  onScroll?: (e:NativeSyntheticEvent<NativeScrollEvent>)=>void
  commandSetter?: (params:CommandSetterParams<T>)=>void
  ListFooterComponent?:React.ReactElement
}

function DraggableFlatList<T>(props:Props<T>) {
  const [data, setData] = useState(props.data);
  const [dataLength, setDataLength] = useState(props.data.length);
  const [last, setLast] = useState(props.data.length)
  const [reff, setReff] = useState<RefObject<any>| null>(null)
  const renderItem = useCallback(props.renderItem, [])
  const read = useCallback(()=>data, [data])
  const add = useCallback((newData, index) => {
    const _data = data.map((item:T)=>item);
    _data.splice(index, 0, newData);
    setData(_data)
    props.dataCallback(_data)
    setLast(index + 1)
  }, [data, last])
  const remove = useCallback((index)=>{
    const _data = data.map((item:T)=>item);
    _data.splice(index, 1);
    setData(_data)
    props.dataCallback(_data)
    return data[index]
  }, [data])
  const shift = useCallback((newIndex, oldIndex)=>{
    if (newIndex!=oldIndex){
      const _data = data.map((item:T)=>item);
      _data.splice(newIndex, 0, _data.splice(oldIndex, 1)[0]);
      setData(_data);
      props.dataCallback(_data)
    }
  },[data])
  if (props.commandSetter)
    props.commandSetter({getData:read, add:add, remove:remove, shift:shift})
  let flatListRef:RefObject<any>;
  useEffect(()=>{
    if (flatListRef !==undefined){
      setReff(flatListRef)
    }
    else if (reff !== null){
      flatListRef = reff
    }
    if (dataLength != data.length && last > 0){
      if (dataLength <data.length && last == data.length){
        setTimeout(() =>{flatListRef.current?.scrollToEnd()}, props.scrollDelay || 1)
      }
      setDataLength(data.length)
    }
  },[data]);
  if (reff && dataLength != props.data.length && last ==1){
    reff.current?.scrollToIndex({animated:true, index:1})
  }
  return (
    <View style={{ height:props.height }}>
      <_DraggableFlatList
        onRef={(ref)=>{flatListRef = ref}}
        onScrollOffsetChange={(offset: number) => {/*console.log(offset)*/}}
        scrollEnabled={props.scrollEnabled}
        data={data}
        renderItem={renderItem}
        keyExtractor={props.keyExtractor}
        onDragEnd={({ data }:DragEndParams<T>) => {setData(data);props.dataCallback(data)}}
        activationDistance={props.sortEnabled?0:9999}
        horizontal={props.horizontal}
        removeClippedSubviews={true}
        windowSize={10 + Math.floor(props.data.length / 2)}
        ListFooterComponent={props.ListFooterComponent}
      />
    </View>
  );
}

export default DraggableFlatList;