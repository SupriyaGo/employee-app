import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {Card, CardItem} from 'native-base';
import Entypo from 'react-native-vector-icons/Entypo';
import * as firebase from 'firebase';

class ViewEmployeeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fName: 'DummyText',
      lName: 'DummyText',
      phone: 'DummyText',
      email: 'DummyText',
      address: 'DummyText',
      imageUrl: null,
      key: null,
      isLoading: true,
    };
  }

  static navigationOptions = {
    title: 'View employee',
  };

  componentDidMount() {
    var key = this.props.route.params.key;

    this.getemployee(key);
  }

  getemployee = async (key) => {
    let self = this;
    let employeeRef = firebase.database().ref().child(key);

    await employeeRef.on('value', (dataSnapshot) => {
      if (dataSnapshot.val()) {
        employeeValue = dataSnapshot.val();
        self.setState({
          fName: employeeValue.fName,
          lName: employeeValue.lName,
          phone: employeeValue.phone,
          email: employeeValue.email,
          address: employeeValue.address,
          imageUrl: employeeValue.imageUrl,
          key: key,
          isLoading: false,
        });
      }
    });
  };

  callAction = (phone) => {
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telpromt:${phone}`;
    } else {
      phoneNumber = `tel:${phone}`;
    }
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Phone number is not available');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  smsAction = (phone) => {
    let phoneNumber = phone;
    phoneNumber = `sms:${phone}`;
    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Phone number is not available');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  editemployee = (key) => {
    this.props.navigation.navigate('Edit', {key: key});
  };

  deleteemployee = (key) => {
    Alert.alert(
      'Delete Employee',
      `${this.state.fName} ${this.state.lName}`,
      [
        {text: 'Cancel', onPress: () => console.log('Cancel pressed')},
        {
          text: 'OK',
          onPress: async () => {
            let employeeRef = firebase.database().ref().child(key);
            await employeeRef.remove((error) => {
              if (!error) {
                this.props.navigation.goBack();
              }
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.employeeIconContainer}>
          <Text style={styles.employeeIcon}>
            {this.state.fName[0].toUpperCase()}
          </Text>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {this.state.fName} {this.state.lName}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Card>
            <CardItem bordered>
              <Text style={styles.infoText}>Phone</Text>
            </CardItem>
            <CardItem bordered>
              <Text style={styles.infoText}>{this.state.phone}</Text>
            </CardItem>
          </Card>
          <Card>
            <CardItem bordered>
              <Text style={styles.infoText}>email</Text>
            </CardItem>
            <CardItem bordered>
              <Text style={styles.infoText}>{this.state.email}</Text>
            </CardItem>
          </Card>
          <Card>
            <CardItem bordered>
              <Text style={styles.infoText}>Address</Text>
            </CardItem>
            <CardItem bordered>
              <Text style={styles.infoText}>{this.state.address}</Text>
            </CardItem>
          </Card>
        </View>
        <Card style={styles.actionContainer}>
          <CardItem style={styles.actionButton} bordered>
            <TouchableOpacity
              onPress={() => {
                this.smsAction(this.state.phone);
              }}>
              <Entypo name="message" size={50} color="#0A79DF" />
            </TouchableOpacity>
          </CardItem>

          <CardItem style={styles.actionButton} bordered>
            <TouchableOpacity
              onPress={() => {
                this.callAction(this.state.phone);
              }}>
              <Entypo name="phone" size={50} color="#0A79DF" />
            </TouchableOpacity>
          </CardItem>
        </Card>

        <Card style={styles.actionContainer}>
          <CardItem style={styles.actionButton} bordered>
            <TouchableOpacity
              onPress={() => {
                this.editemployee(this.state.key);
              }}>
              <Entypo name="edit" size={50} color="#0A79DF" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          </CardItem>

          <CardItem style={styles.actionButton} bordered>
            <TouchableOpacity
              onPress={() => {
                this.deleteemployee(this.state.key);
              }}>
              <Entypo name="trash" size={50} color="#0A79DF" />
            </TouchableOpacity>
          </CardItem>
        </Card>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  employeeIconContainer: {
    height: 200,
    backgroundColor: '#0A79DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  employeeIcon: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameContainer: {
    width: '100%',
    height: 70,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
  },
  name: {
    fontSize: 24,
    color: '#000',
    fontWeight: '900',
  },
  infoText: {
    fontSize: 18,
    fontWeight: '300',
  },
  actionContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#0A79DF',
    fontWeight: '900',
  },
  infoContainer: {
    flexDirection: 'column',
  },
});

export default ViewEmployeeScreen;
