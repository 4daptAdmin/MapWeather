import React from "react";
import { View, StyleSheet,Text } from "react-native";
import MapView from "react-native-maps";

const usersMap = props => {
  let userLocationMarker = null;

  if (props.userLocation) {
    userLocationMarker = <MapView.Marker coordinate={props.userLocation} />;
  }


  return (
    <View style={styles.mapContainer}>
      <MapView
        initialRegion={{
          latitude: 37.6023531819,
          longitude: 126.9544404873,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0421
        }}
        region={props.userLocation}
        onRegionChangeComplete={props.onRegionChangeComplete}
        style={styles.map}
      >
        {userLocationMarker}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: "65%"
  },
  map: {
    width: "100%",
    height: "100%"
  }
});

export default usersMap;