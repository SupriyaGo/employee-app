import React, {Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import {Form, Item, Input, Button, Label, Thumbnail} from 'native-base';
import * as firebase from 'firebase';
import ImagePicker from 'react-native-image-picker';

class AddEmployeeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fName: '',
      lName: '',
      phone: '',
      email: '',
      address: '',
      image: 'empty',
      imageDownloadUrl: '',
      isUploading: false,
      location: {
        long: '',
        lat: '',
      },
    };
  }

  async componentDidMount() {
    let latitude = await AsyncStorage.getItem('latitude');
    latitude = JSON.parse(latitude);

    let longitude = await AsyncStorage.getItem('longitude');
    longitude = JSON.parse(longitude);

    const location = {
      long: longitude,
      lat: latitude,
    };
    if (longitude !== undefined && latitude !== undefined) {
      this.setState({location});
    }
  }

  saveEmployee = async () => {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    const phoneExpression = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (
      this.state.fName !== '' &&
      this.state.lName !== '' &&
      phoneExpression.test(this.state.phone) &&
      expression.test(String(this.state.email).toLowerCase()) &&
      this.state.address !== ''
    ) {
      this.setState({isUploading: true});
      const dbReference = firebase.database().ref();
      const storageRef = firebase.storage().ref();

      if (this.state.image !== 'empty') {
        console.log(this.state.image);
        const downloadUrl = await this.uploadImageAsync(
          this.state.image,
          storageRef,
        );
        this.setState({imageDownloadUrl: downloadUrl});
      }

      //save all values to an object

      var employee = {
        fName: this.state.fName,
        lName: this.state.lName,
        phone: this.state.phone,
        email: this.state.email,
        address: this.state.address,
        imageUrl: this.state.imageDownloadUrl,
        location: this.state.location,
      };

      await dbReference.push(employee, (error) => {
        if (!error) {
          return this.props.navigation.goBack();
        }
      });
    } else {
      alert('Please enter correct input');
    }
  };

  // Launch Camera
  cameraLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (res) => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        const source = {uri: res.uri};

        this.setState({
          image: res.uri,
        });
      }
    });
  };

  imageGalleryLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, (res) => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        const source = {uri: res.uri};

        this.setState({
          image: res.uri,
        });
      }
    });
  };

  uploadImageAsync = async (uri, storageRef) => {
    const fileExtenstion = uri.split('.').pop();

    //create blob
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    //upload part
    var uuid = uuidv4();
    const ref = storageRef
      .child('EmployeeImages')
      .child(uuid + '.' + fileExtenstion);
    const snapshot = await ref.put(blob);

    //close blob
    blob.close();
    return await snapshot.ref.getDownloadURL();
  };

  render() {
    if (this.state.isUploading) {
      return (
        <View
          style={{flex: 1, alignContent: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#0A79DF" />
          <Text style={{textAlign: 'center'}}>
            Data Uploading please wait..
          </Text>
        </View>
      );
    }
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss;
        }}>
        <ScrollView style={styles.container}>
          <Image
            source={
              this.state.image === 'empty'
                ? require('./../../assets/person.png')
                : {
                    uri: this.state.image,
                  }
            }
            style={styles.imagePicker}
          />

          <View style={styles.imagepickerBtnsContainer}>
            <TouchableOpacity
              onPress={this.cameraLaunch}
              style={styles.imagepickerBtns}>
              <Text style={styles.imagepickerBtntext}>capture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.imageGalleryLaunch}
              style={styles.imagepickerBtns}>
              <Text style={styles.imagepickerBtntext}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <Form>
            <Item style={styles.inputItem}>
              <Label>First Name</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={(fName) => this.setState({fName})}
              />
            </Item>
            <Item style={styles.inputItem}>
              <Label>Last Name</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={(lName) => this.setState({lName})}
              />
            </Item>
            <Item style={styles.inputItem}>
              <Label>Phone</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="number-pad"
                onChangeText={(phone) => this.setState({phone})}
              />
            </Item>
            <Item style={styles.inputItem}>
              <Label>Email</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(email) => this.setState({email})}
              />
            </Item>
            <Item style={styles.inputItem}>
              <Label>Address</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                onChangeText={(address) => this.setState({address})}
              />
            </Item>
          </Form>
          <Button
            style={styles.button}
            full
            onPress={() => this.saveEmployee()}>
            <Text style={styles.buttonText}>Save</Text>
          </Button>
          <View style={styles.empty} />
        </ScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    height: 500,
  },
  imagePicker: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 100,
    borderColor: '#c1c1c1',
    borderWidth: 2,
  },
  imagepickerBtnsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagepickerBtns: {},
  imagepickerBtntext: {
    padding: 10,
    fontSize: 16,
    color: '#0A79DF',
  },
  inputItem: {
    margin: 10,
  },
  button: {
    backgroundColor: '#0A79DF',
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    height: 60,
    backgroundColor: '#FFF',
  },
});

export default AddEmployeeScreen;
