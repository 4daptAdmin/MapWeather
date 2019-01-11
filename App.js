import React, { Component } from 'react'
import { StyleSheet, Text, View, StatusBar, Button } from 'react-native'
import Weather from './Weather'
import UserMap from './UserMap'

const API_KEY = 'd5tom7ZXIn5TlnHxjc3L8JNrHAYleWdLt67H8AKAoMAXDv0KBZlCJ0XNXmCULfKPoy07PtpG762TCZ8%2FhA9omQ%3D%3D'
export default class App extends Component {
  state = {
    isLoaded: false,
    error: null,
    temperature: null,
    name: null,
    userLocation: null
  }

  componentDidMount () {
    navigator.geolocation.getCurrentPosition(
      position => {
        // this._getWeather(position.coords.latitude, position.coords.longitude)
        position.coords.latitudeDelta = 0.0922
        position.coords.longitudeDelta = 0.0921
        this.setState({
          userLocation: position.coords
        })
      },
      error => {
        this.setState({
          error: error
        })
      }
    )
  }
  /*
  _getWeather = (lat, long) => {
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=${API_KEY}`)
      .then(response => response.json())
      .then(json => {
        this.setState({
          temperature: json.main.temp - 273.15,
          name: json.weather[0].main,
          isLoaded: true
        })
      })
  } */

  // ----------------------------------------------------------
  // 기상청 홈페이지에서 발췌한 변환 함수
  //
  // LCC DFS 좌표변환을 위한 기초 자료
  //

  // LCC DFS 좌표변환 ( code :
  //          "toXY"(위경도->좌표, v1:위도, v2:경도),
  //          "toLL"(좌표->위경도,v1:x, v2:y) )
  //

  _dfs_xy_conv = (v1, v2) => {
    var DEGRAD = Math.PI / 180.0
    var RADDEG = 180.0 / Math.PI
    var RE = 6371.00877 // 지구 반경(km)
    var GRID = 5.0 // 격자 간격(km)
    var SLAT1 = 30.0 // 투영 위도1(degree)
    var SLAT2 = 60.0 // 투영 위도2(degree)
    var OLON = 126.0 // 기준점 경도(degree)
    var OLAT = 38.0 // 기준점 위도(degree)
    var XO = 43 // 기준점 X좌표(GRID)
    var YO = 136 // 기1준점 Y좌표(GRID)

    var re = RE / GRID
    var slat1 = SLAT1 * DEGRAD
    var slat2 = SLAT2 * DEGRAD
    var olon = OLON * DEGRAD
    var olat = OLAT * DEGRAD

    var sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
    ro = (re * sf) / Math.pow(ro, sn)
    var rs = {}

    rs['lat'] = v1
    rs['lng'] = v2
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5)
    ra = (re * sf) / Math.pow(ra, sn)
    var theta = v2 * DEGRAD - olon
    if (theta > Math.PI) theta -= 2.0 * Math.PI
    if (theta < -Math.PI) theta += 2.0 * Math.PI
    theta *= sn
    rs['x'] = Math.ceil(ra * Math.sin(theta) + XO + 0.5)
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)

    return rs
  }

  _getWeatherKorea = (lat, long) => {
    var xy = this._dfs_xy_conv(lat, long)

    fetch(
      `http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData?serviceKey=${API_KEY}&nx=` +
        xy.x +
        `&ny=${xy.y}&base_date=20190111&base_time=1100&numOfRows=10&pageNo=1&_type=json`
    )
      .then(response => response.json())
      .then(json => {
        // console.log(json)
        var rain_state = json.response.body.items.item[1].category // PYT(강수형태)
        var sky = json.response.body.items.item[3].category // SKY(하늘상태)
        var temperature = json.response.body.items.item[4].fcstValue // T3H (3시간 기온)
        var name = 'Clear'

        if (rain_state != 0) {
          switch (rain_state) {
            case 1:
              name = 'Rain'
              break
            case 2:
              name = 'Haze'
              break
            case 3:
              name = 'Snow'
              break
          }
        } else {
          switch (sky) {
            case 1:
              name = 'Clear' // 맑음
              break
            case 2:
              name = 'Clouds' // 구름조금
              break
            case 3:
              name = 'Clouds' // 구름많음
              break
            case 4:
              name = 'Clouds' // 흐림
              break
          }
        } // if 종료

        this.setState({
          temperature: temperature,
          name: name,
          isLoaded: true
        })

        console.log(temperature)
      })
  }

  _onRegionChangeComplete = region => {
    this.setState({
      userLocation: region,
      isLoaded: false
    })
    // this._getWeather(region.latitude, region.longitude);
    this._getWeatherKorea(region.latitude, region.longitude)
  }

  render () {
    const { isLoaded, error, temperature, name } = this.state
    return (
      <View style={styles.container}>
        <StatusBar hidden />

        <UserMap userLocation={this.state.userLocation} onRegionChangeComplete={this._onRegionChangeComplete} />

        {isLoaded ? (
          <Weather weatherName={name} temp={Math.ceil(temperature)} />
        ) : (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>날씨정보가져오는중..</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  errorText: {
    color: 'red',
    backgroundColor: 'transparent',
    marginBottom: 40
  },
  loading: {
    flex: 1,
    backgroundColor: '#FDF6AA',
    justifyContent: 'flex-end',
    paddingLeft: 25
  },
  loadingText: {
    fontSize: 25,
    marginBottom: 24
  }
})
