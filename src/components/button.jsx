import { StyleSheet, TouchableOpacity, View } from "react-native"

const PhotoShutter = ({takePhoto}) => {
  const takePicture = () => {
    takePhoto()
  }
  return(
    <View style={styles.mainButton}>
      <TouchableOpacity onPress={takePicture} style={styles.button}></TouchableOpacity>
    </View>
    
  )
}

export default PhotoShutter

const styles = StyleSheet.create({
  mainButton:{
    height:94,
    width:162,
    backgroundColor:'#000',
    borderWidth:5,
    borderColor:'#d9d9d9',
    borderRadius:50,
    display:'flex',
    alignItems:"center",
    justifyContent:"center"
  },
  button:{
    height:77,
    width:144,
    backgroundColor:'#d9d9d9',
    borderWidth:5,
    borderRadius:60,
    display:'flex',
    alignItems:"center",
    justifyContent:"center"
  }
})