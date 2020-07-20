import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import * as firebase from 'firebase';
import Entypo from 'react-native-vector-icons/Entypo';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-community/async-storage';
import List from './../Components/EmployeeList';

class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
      isListEmpty: false,
    };
  }

  async componentDidMount() {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Employee App',
        message: 'This app needs access to your location ',
      },
    );

    if (granted == 'granted') {
      Geolocation.getCurrentPosition(
        async (position) => {
          await AsyncStorage.setItem(
            'latitude',
            JSON.stringify(position.coords.latitude),
          );
          await AsyncStorage.setItem(
            'longitude',
            JSON.stringify(position.coords.longitude),
          );
        },
        (error) => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } else {
      await AsyncStorage.setItem('latitude', JSON.stringify(-33.8952763));
      await AsyncStorage.setItem('longitude', JSON.stringify(151.2722256));
    }
    this.getAllEmployee();
  }

  getAllEmployee = () => {
    let self = this;
    let employeeRef = firebase.database().ref();

    employeeRef.on('value', (dataSnapshot) => {
      if (dataSnapshot.val()) {
        let employeeResult = Object.values(dataSnapshot.val());
        let employeeKey = Object.keys(dataSnapshot.val());

        employeeKey.forEach((value, key) => {
          employeeResult[key]['key'] = value;
        });
        self.setState({
          data: employeeResult,
          isListEmpty: false,
        });
      } else {
        self.setState({isListEmpty: true, isLoading: false});
      }

      self.setState({isLoading: false});
    });
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#0A79DF" />
          <Text style={{textAlign: 'center'}}>Please wait..</Text>
        </View>
      );
    } else if (this.state.isListEmpty) {
      return (
        <View
          style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
          <Entypo style={{alignSelf: 'center'}} name="plus" size={35} />
          <Text style={{textAlign: 'center'}}>Please add some data</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Add');
            }}
            style={styles.floatButton}>
            <Entypo name="plus" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <List listData={this.state.data} navigation={this.props.navigation} />

        <TouchableOpacity
          style={styles.floatButton}
          onPress={() => {
            this.props.navigation.navigate('Add');
          }}>
          <Text style={styles.btnIcon}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  floatButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    position: 'absolute',
    bottom: 10,
    right: 10,
    height: 60,
    backgroundColor: '#0A79DF',
    borderRadius: 100,
  },
});

export default HomeScreen;
