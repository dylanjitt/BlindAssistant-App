import { StyleSheet, TouchableOpacity, View } from "react-native"
import { DollarIcon } from "./DollarIcon"
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
const PhotoShutter = ({ takePhoto ,taken,backToPhoto,listModes,setMode}) => {
  const takePicture = () => {
    takePhoto()
  }

  const backToCamera = () => {
    backToPhoto()
  }
  return (
    <View style={styles.container}>
      {!taken?(
        <TouchableOpacity style={styles.button2}>
          <FontAwesome5 name="car" size={55} color="black" />
        </TouchableOpacity>
      ):(<></>)}
      <View style={styles.mainButton}>
        <TouchableOpacity onPress={!taken?takePicture:backToCamera} style={styles.button}>
          <DollarIcon/>
        </TouchableOpacity>
      </View>
      {!taken?(
        <TouchableOpacity style={styles.button2}>
          <Ionicons name="eye" size={55} color="black" />
        </TouchableOpacity>
      ):(<></>)}
    </View>


  )
}

export default PhotoShutter

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection:'row',
    width: '100%',
    paddingBottom:20
  },
  body: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainButton: {
    height: 94,
    width: 162,
    backgroundColor: '#000',
    borderWidth: 5,
    borderColor: '#d9d9d9',
    borderRadius: 50,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    height: 87,
    width: 154,
    backgroundColor: '#d9d9d9',
    borderWidth: 5,
    borderRadius: 60,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center"
  },
  button2:{
    height: 75,
    width: 75,
    backgroundColor: '#d9d9d9',
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
    borderRadius:50,
    margin:10
  }
})