import { StyleSheet, TouchableOpacity, View } from "react-native"

const PhotoShutter = ({ takePhoto }) => {
  const takePicture = () => {
    takePhoto()
  }
  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <TouchableOpacity onPress={takePicture} style={styles.button}></TouchableOpacity>
      </View>
    </View>


  )
}

export default PhotoShutter

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom:6
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
  }
})