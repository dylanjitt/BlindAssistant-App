import { ActivityIndicator, ScrollView, Text } from "react-native"

export const ResponseLayout = ({loading,styles,responseText}) =>{
  return(<ScrollView>
    {loading ? (
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
    ) : (
      <Text style={styles.resultText}>{responseText}</Text>
    )}
  </ScrollView>)
}