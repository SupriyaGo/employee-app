import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './src/Containers/Home';
import EditEmployeeScreen from './src/Containers/EditEmployee';
import ViewEmployeeScreen from './src/Containers/ViewEmployee';
import AddEmployeeScreen from './src/Containers/AddEmployee';

import * as firebase from 'firebase';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          title: 'Employee App',
          headerStyle: {
            backgroundColor: '#0A79DF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '400',
          },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Edit" component={EditEmployeeScreen} />
        <Stack.Screen name="View" component={ViewEmployeeScreen} />
        <Stack.Screen name="Add" component={AddEmployeeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

var firebaseConfig = {
  apiKey: 'AIzaSyBV8_oyjPjyLqUoNkr5QrLJYcdh1sUcnPc',
  authDomain: 'employee-app-162a6.firebaseapp.com',
  databaseURL: 'https://employee-app-162a6.firebaseio.com',
  projectId: 'employee-app-162a6',
  storageBucket: 'employee-app-162a6.appspot.com',
  messagingSenderId: '759680096762',
  appId: '1:759680096762:web:cf691a99085d429da8ec43',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default App;
