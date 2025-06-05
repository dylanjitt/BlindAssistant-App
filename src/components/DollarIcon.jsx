import { View } from "react-native"
import Foundation from '@expo/vector-icons/Foundation';
export const DollarIcon = () =>{
  return(
    <View style={{width:55,height:55,backgroundColor:'#000',borderRadius:50,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Foundation name='dollar' size={55} color={'#d9d9d9'}/>
    </View>
  )
}