import React, { Component } from "react";
import { StyleSheet, Text, View, StatusBar, Button } from "react-native";
import Weather from "./Weather";
import UserMap from "./UserMap";

const API_KEY = "8042367a40d903407a2eee2c0cfa759a";

export default class App extends Component {
  state = {
    isLoaded: false,
    error: null,
    temperature: null,
    name: null,
    userLocation: null
  };

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this._getWeather(position.coords.latitude, position.coords.longitude);
        position.coords.latitudeDelta = 0.0922;
        position.coords.longitudeDelta = 0.0921;
//        console.log(position.coords);
        this.setState({
          userLocation: position.coords,
        });
      },
      error => {
        this.setState({
          error: error
        });
      }
    );
  }
  _getWeather = (lat, long) => {
    fetch(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=${API_KEY}`
    )
      .then(response => response.json())
      .then(json => {
        this.setState({
          temperature: json.main.temp,
          name: json.weather[0].main,
          isLoaded: true
        });
      });
  };


  _onPress = (e) => {
    console.log(e.nativeEvent)
    e.nativeEvent.coordinate.latitudeDelta = 0.0922;
    e.nativeEvent.coordinate.longitudeDelta = 0.0921;  
    this.setState({
      userLocation: e.nativeEvent.coordinate,
      isLoaded: false
    });
    this._getWeather(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude);
  };


  _onRegionChange = (region) => {
    this.setState({ region });
  }

  render() {
    const { isLoaded, error, temperature, name } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
      
        <UserMap
          userLocation={this.state.userLocation}
          onPress1={this._onPress}
        />
       
        {isLoaded ? (
          <Weather
            weatherName={name}
            temp={Math.ceil(temperature - 273.15)}
          />
        ) : (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>날씨정보가져오는중..</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  errorText: {
    color: "red",
    backgroundColor: "transparent",
    marginBottom: 40
  },
  loading: {
    flex: 1,
    backgroundColor: "#FDF6AA",
    justifyContent: "flex-end",
    paddingLeft: 25
  },
  loadingText: {
    fontSize: 25,
    marginBottom: 24
  }
});