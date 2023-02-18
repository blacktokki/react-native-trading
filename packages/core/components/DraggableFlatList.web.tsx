import React, { useState, useCallback, useRef, useEffect, RefObject } from "react";
import { View, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import {SortableContainer, SortableElement, SortEnd} from 'react-sortable-hoc';

const Results = SortableContainer((props:any) => {
    const [dataLength, setDataLength] = useState(props.data.length)
    const ref = useRef<FlatList>(null)
    useEffect(()=>{
      //console.log(dataLength, '!=', props.data.length, '==', props.last)
      if (dataLength != props.data.length && props.last > 0){
        if (dataLength < props.data.length && props.last == props.data.length){
          setTimeout(() =>{ref.current?.scrollToEnd()}, props.scrollDelay)
        }
        setDataLength(props.data.length)
      }
      if (dataLength < props.data.length && props.last ==1){
        ref.current?.scrollToIndex({animated:true, index:1})
      }
      const el = (ref.current?.getNativeScrollRef() as any).getScrollableNode()
      if (el && props.horizontal) {
        const onWheel = (e:any) => {
          if (e.deltaY == 0) return;
          e.preventDefault();
          el.scrollTo({
            left: el.scrollLeft + e.deltaY,
          });
        };
        el.addEventListener("wheel", onWheel);
        return () => el.removeEventListener("wheel", onWheel);
      }
    });
    return(
      <FlatList
        ref={ref}
        renderItem={props.renderItem}
        data={props.data}
        scrollEnabled={props.scrollEnabled}
        keyExtractor={(item, index) => index.toString()}
        horizontal={props.horizontal}
        removeClippedSubviews={true}
        windowSize={10 + Math.floor(props.data.length / 2)}
        ListFooterComponent={props.ListFooterComponent}
        onScroll={props.onScroll}
        //contentContainerStyle={{
        //    flexGrow: 1
        //}}
      />
    )
  });

const Element = SortableElement((props:any) => {
    return props.children
});

export type RenderItemParams<T> = {item:T, index:number}
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
  horizontal: boolean | null | undefined,
  onScroll?: (e:NativeSyntheticEvent<NativeScrollEvent>)=>void,
  commandSetter?: (params:CommandSetterParams<T>)=>void
  ListFooterComponent?:React.ReactElement
}

function DraggableFlatList<T>(props:Props<T>) {
  const [data, setData] = useState(props.data);
  const [last, setLast] = useState(props.data.length)
  const cacheItem = useRef<{[index: number]:[T, React.ReactNode]}>({}) 
  const renderItem = useCallback(
    ({item, index, isActive}) => {
      if (index in cacheItem.current && cacheItem.current[index][0] == item)
        return cacheItem.current[index][1]
        cacheItem.current[index] = [item, (<Element key = {index} index={index}>
        {props.renderItem({item:item, index:index})}
      </Element>)]
      return cacheItem.current[index][1]
  },
    []
  );
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
    setLast(-1)
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
  return (
    <View style={{ height:props.height }}>
      <Results
        data={data}
        renderItem={renderItem}
        keyExtractor={props.keyExtractor}
        onSortEnd={({newIndex, oldIndex}:SortEnd) => shift(newIndex, oldIndex)}
        distance={props.sortEnabled ? 5 : 99999}
        scrollEnabled={props.scrollEnabled}
        ListFooterComponent={props.ListFooterComponent}
        last={last}
        horizontal={props.horizontal}
        scrollDelay={props.scrollDelay || 0.5 * data.length}
        updateBeforeSortStart={props.updateBeforeSortStart}
        onScroll={props.onScroll}
  />
    </View>
  );
}

export default DraggableFlatList;