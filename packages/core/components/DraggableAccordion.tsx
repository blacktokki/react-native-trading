import React from 'react';
import { Platform, StyleSheet, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Accordion, {RenderItemParams as AccordionRenderItemParams }  from './Accordion'
import DraggableFlatList, {RenderItemParams as _RenderItemParams, CommandSetterParams as _CommandSetterParams} from './DraggableFlatList'
export type RenderItemParams<T> = _RenderItemParams<T> & AccordionRenderItemParams<T>
export type CommandSetterParams<T> = _CommandSetterParams<T>

type Props<T> ={
  dataCallback:(data:T[])=>void,
  height: number,
  sortEnabled:boolean,
  renderItem:(params:RenderItemParams<T>)=>React.ReactNode
  onScroll?: (e:NativeSyntheticEvent<NativeScrollEvent>)=>void,
  commandSetter?: (params:CommandSetterParams<T>)=> void
  ListFooterComponent?:React.ReactElement
}

export default class DraggableAccordion<T, P> extends Accordion<T, RenderItemParams<T> ,Props<T> & P>{
  initExpanded:boolean = false

  renderDraggableItem = (params:_RenderItemParams<T>) => this.renderItem({...params, initExpanded:this.initExpanded} as RenderItemParams<T> & {initExpanded:boolean})
  componentDidMount(){
    this.initExpanded = true
  }
  updateBeforeSortStart = ()=>{
    this.childrenRef.forEach((ref) => {
      if (ref && ref.state.expanded){
        ref.onClose(()=>{})
      }
    });
  }

  render() {
    return (
      <View style={styles.MainContainer}>
        <DraggableFlatList<T>
          data={this.props.data}
          dataCallback={this.props.dataCallback}
          commandSetter={this.props.commandSetter}
          renderItem={this.renderDraggableItem}//1
          sortEnabled={this.props.sortEnabled}
          height={this.props.height}
          keyExtractor={(item, index)=>`${index}`}
          scrollDelay={this.expandSpeed * 2}
          horizontal={this.props.horizontal}
          updateBeforeSortStart={this.updateBeforeSortStart}
          onScroll={this.props.onScroll}
          ListFooterComponent={this.props.ListFooterComponent}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: (Platform.OS === 'ios') ? 20 : 0
  }
});
