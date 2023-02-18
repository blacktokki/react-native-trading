import React, { Component } from 'react';
import { Platform, StyleSheet, View, ScrollView, Animated, GestureResponderEvent, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

export type renderItemInnerParams<T> = {
  item:T,
  holderStyle:StyleProp<ViewStyle>,
  buttonOnPress:(event:GestureResponderEvent)=>void,
  onClose:(callback:()=>void)=>void,
  contentStyle:StyleProp<ViewStyle>,
  contentOnLayout:(event:LayoutChangeEvent)=>void,
}

interface PanelProp<T>{
    item: T,
    numnum:number,
    initExpanded:boolean,
    horizontal?:boolean | null,
    expandSpeed:number,
    holderStyle:StyleProp<ViewStyle>,
    closeAll: ()=>void,
    renderItem: (params:renderItemInnerParams<T>)=>React.ReactNode
}

interface PanelState{
    expanded: boolean
    maxHeight: number | null,
    style:any,
    onCloseCallback: ()=>void,
    heightLock: boolean
}

export class Accordion_Panel<T> extends Component<PanelProp<T>, PanelState> {
  state:PanelState = {
    expanded: this.props.initExpanded,  
    maxHeight: null,
    style: {
        overflow: 'hidden'
    },
    onCloseCallback:()=>{},
    heightLock: true
  }
  mount:boolean = false
  useCloseCallback = false
  lastHeight?:number = undefined

  setExpand(value:boolean){
    //console.log('num', this.props.numnum, 'mount', this.mount, 'will-expended', value, this.state)
    if (this.mount){
      this.setState({expanded:value})
    }
  }

  onClose(callback:()=>void){
    this.useCloseCallback = true,
    Animated.timing(this.state.style.height, {
      toValue: 0,
      duration: 0,
      useNativeDriver:false,
    }).start();
    this.setState({
      expanded:false,
      style:{
        overflow: 'hidden',
        height: new Animated.Value(0)
      },
      onCloseCallback:callback
    })
  }

  componentDidMount(){
    if(this.props.initExpanded)
      this.props.closeAll()
    this.mount = true
  }
  componentWillUnmount(){
    this.mount = false
  }

  componentDidUpdate(){
    if (this.state.style.height !== undefined && this.state.maxHeight !== null){
      //console.log(this.state.expanded, this.state.style.height._value, this.state.maxHeight)
      if (this.state.expanded && this.state.style.height._value == 0) {
        Animated.timing(this.state.style.height, {
          toValue: this.state.maxHeight,
          duration: this.props.expandSpeed,
          useNativeDriver:false,
        }).start(()=>this.setState({heightLock:false}));
      }
      else if (!this.state.expanded && this.state.style.height._value == this.state.maxHeight && this.state.heightLock == false){
        let lastHeight = this.lastHeight || this.state.maxHeight
        this.setState({heightLock:true, maxHeight:lastHeight})
        Animated.timing(this.state.style.height, {toValue:lastHeight, duration:0, useNativeDriver:false}).start(()=>
          Animated.timing(this.state.style.height, {
            toValue: 0,
            duration: this.props.expandSpeed,
            useNativeDriver:false,
          }).start()
        )
      }
    }
    else if(this.state.maxHeight !== null){
      this.setState({
        style:{
          overflow: 'hidden',
          height: new Animated.Value(0)
        }
      })
    }
    if (this.useCloseCallback){
      this.useCloseCallback = false
      setTimeout(this.state.onCloseCallback, 100)
    }
  }
  onPress(event:GestureResponderEvent){
    this.props.closeAll()
    this.setExpand(true)
  }
 
  render() {
    const holderStyle:any[] = [this.props.holderStyle, {opacity:this.state.maxHeight== null?0:100}]
    if (this.props.horizontal)
      holderStyle.push({height:'100%', backgroundColor: 'rgba(0, 0, 0, 0)'})
    return this.props.renderItem({
      item:this.props.item,
      holderStyle:holderStyle,
      buttonOnPress:this.onPress.bind(this),
      contentStyle:[this.state.style, this.state.heightLock?{}:{height:undefined}],
      contentOnLayout:((event:LayoutChangeEvent) => {
        var {x, y, width, height} = event.nativeEvent.layout;
        if (this.state.maxHeight == null){
          //console.log(this.state.maxHeight, height)
          this.setState({
            maxHeight: height
          })
        }
        this.lastHeight = height
      }).bind(this),
      onClose:this.onClose.bind(this),
    })
  }
}




export type RenderItemParams<T> = renderItemInnerParams<T> & {index: number}

type Props<T, R extends RenderItemParams<T>> = {
    data:T[],
    scrollEnabled?:boolean,
    renderItem:(params:R)=>React.ReactNode,
    keyExtractor:(item:T, index:number)=>string,
    holderStyle:StyleProp<ViewStyle>,
    expandSpeed?:number,
    horizontal?: boolean | null
  }

export default class Accordion<T, R extends RenderItemParams<T>, P> extends Component<Props<T, R> & P> {
  constructor(props:Props<T, R> & P) {
    super(props);
    this.childrenRef = []
    this.expandSpeed = props.expandSpeed || 200
  }
  childrenRef: (Accordion_Panel<T>| null)[];
  expandSpeed: number;

  update_Layout = () => {
    this.childrenRef.forEach((ref) => {
      if (ref && ref.state.expanded){
        ref.setExpand(false)
      }
    });
  }
  
  renderItem = (params:R & {initExpanded:boolean}) => {
    return <Accordion_Panel<T>
        ref={ref=>{this.childrenRef.push(ref)}}
        numnum={params.index}
        key={params.index}
        holderStyle={this.props.holderStyle}
        horizontal={this.props.horizontal}
        closeAll={this.update_Layout.bind(this)}
        item={params.item}
        initExpanded={params.initExpanded}
        expandSpeed={this.expandSpeed}
        renderItem={(params2:renderItemInnerParams<T>)=> this.props.renderItem({...params2, ...params} as R)}
    />}

  render() {
    return (
      <View style={styles.MainContainer}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 5 }}>
          {
            this.props.data.map((item, index)=> this.renderItem({item:item, index:index, initExpanded:false} as R & {initExpanded:boolean}))
          }
        </ScrollView>
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