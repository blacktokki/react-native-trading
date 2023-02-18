
import React from "react";
import {TouchableOpacity, Text, Dimensions } from "react-native";
import { useHeaderHeight } from '@react-navigation/stack';
import DraggableFlatList, {RenderItemParams} from './DraggableFlatList'
const NUM_ITEMS = 10;

function getColor(i: number) {
  const multiplier = 64 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal+192}, ${Math.abs(32 - colorVal) + 192}, ${64 - colorVal + 192})`;
}

const exampleData: Item[] = [...Array(20)].map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    key: `item-${backgroundColor}`,
    label: String(index),
    backgroundColor
  };
});

const exampleRenderItem = ({ item, index, drag, isActive }:RenderItemParams<Item>) => {
    return (
      <TouchableOpacity
        style={{
          height: 100,
          backgroundColor: isActive ? "red" : item.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
        onLongPress={drag}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 32,
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }

type Item = {
  key: string;
  label: string;
  backgroundColor: string;
};

export default function DraggableFlatListDummy(){
    const headerHeight = useHeaderHeight();
    return (<DraggableFlatList<Item>
        height={Dimensions.get("window").height - headerHeight}
        data={exampleData}
        dataCallback={()=>{}}
        sortEnabled={false}
        horizontal={false}
        renderItem={exampleRenderItem}
        keyExtractor={(item:Item, index:number) => `draggable-item-${item.key}`}
    />)
}