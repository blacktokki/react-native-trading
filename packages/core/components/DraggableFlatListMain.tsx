
import React from "react";
import { View, TouchableOpacity, Dimensions, Platform, StyleProp, ViewStyle, Animated, NativeSyntheticEvent, NativeScrollEvent  } from "react-native";
import { useHeaderHeight } from '@react-navigation/stack';
import DraggableAccordion, { RenderItemParams, CommandSetterParams as _CommandSetterParams } from './DraggableAccordion'
export type CommandSetterParams = _CommandSetterParams<DraggableSection>

const renderItem = ({ item, index, drag, isActive, holderStyle, buttonOnPress, contentStyle, contentOnLayout, onClose }:RenderItemParams<DraggableSection>) => {
  return (
    <View style={holderStyle}>
        <TouchableOpacity activeOpacity={0.7} onPress={buttonOnPress} style={{padding: 10, backgroundColor: '#888'}}>
          {item.header}
        </TouchableOpacity>
        <Animated.View
          style={[contentStyle, isActive?{height:0}:{}]} 
          onLayout={contentOnLayout}>
          {item.body}
        </Animated.View>
      </View>
  )
}

const renderItemSort = (params:RenderItemParams<DraggableSection>) => {
  return (
        <TouchableOpacity
        style={{
          backgroundColor: params.isActive ? "red" : "white",
          marginRight: Platform.OS == 'web'? 0 : 5,
          alignItems: "center",
          justifyContent: "center",
        }}
        onLongPress={()=>{if(params.drag)params.onClose(params.drag)}}
      >
      {renderItem(params)}
    </TouchableOpacity>
    )
}
const renderItemUnsort = (params:RenderItemParams<DraggableSection>) => {
  return (
    <View
      style={{
        backgroundColor: "white",
        marginRight: 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {renderItem(params)}
    </View>
  )
}


type Props = {
  children: React.ReactNode,
  header: React.ReactNode[],
  holderStyle?:StyleProp<ViewStyle>,
  scrollEnabled?: boolean, 
  sortEnabled?: boolean, 
  horizontal?: boolean | null,
  dataCallback:(data:React.ReactNode[])=>void,
  onScroll?: (e:NativeSyntheticEvent<NativeScrollEvent>)=>void,
  commandSetter?: (params:CommandSetterParams)=> void
  ListFooterComponent?:React.ReactElement
}

type DraggableSection = {
  header:React.ReactNode
  body:React.ReactNode
}


export default function DraggableFlatListMain(props:Props){
    const headerHeight = useHeaderHeight();
    const _data =  React.Children.toArray(props.children).map((value, index)=>({header:props.header[index] || (<View></View>), body:value}))
    const _sortEnabled = (props.sortEnabled === undefined ? true : props.sortEnabled)
    const _renderItem = _sortEnabled ? renderItemSort : renderItemUnsort
    const _height = Dimensions.get("window").height - headerHeight
    const __renderItem = (params:RenderItemParams<DraggableSection>)=> {
      return <View style={props.horizontal?{minHeight:0, width:Dimensions.get('window').width}:{flex:1}}>{_renderItem(params)}</View>
    }
    return (<DraggableAccordion<DraggableSection, {}>
        data={_data}
        commandSetter={props.commandSetter}
        dataCallback={props.dataCallback}
        sortEnabled={_sortEnabled}
        scrollEnabled={props.scrollEnabled}
        height={_height}
        holderStyle={props.holderStyle}
        renderItem={__renderItem}
        keyExtractor={(item:React.ReactNode, index:number) => `main-draggable-item-${index}`}
        horizontal={props.horizontal}
        onScroll={props.onScroll}
        ListFooterComponent={props.ListFooterComponent}
    />)
}