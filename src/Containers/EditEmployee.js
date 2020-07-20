import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import {Form, Item, Input, Label, Button} from 'native-base';
import uuid from 'uuid';
import * as firebase from 'firebase';
import ImagePicker from 'react-native-image-picker';

class EditEmployeeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fName: '',
      lName: '',
      phone: '',
      email: '',
      address: '',
      image: 'empty',
      imageDownloadUrl: 'empty',
      isUploading: false,
      isLoading: true,
      key: '',
    };
  }

  componentDidMount() {
    var key = this.props.route.params.key;
    this.getEmployee(key);
  }

  getEmployee = async (key) => {
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

  updateEmployee = async (key) => {
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
        const downloadUrl = await this.uploadImageAsync(
          this.state.image,
          storageRef,
        );
        this.setState({imageDownloadUrl: downloadUrl});
      }
      var employee = {
        fName: this.state.fName,
        lName: this.state.lName,
        phone: this.state.phone,
        email: this.state.email,
        address: this.state.address,
        imageUrl: this.state.imageUrl,
      };
      await dbReference.child(key).set(employee, (error) => {
        if (!error) {
          return this.props.navigation.goBack();
        }
      });
    } else {
      alert('Please enter correct input');
    }
  };

  cameraLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (res) => {
      // console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        const source = {uri: res.uri};
        // console.log('response', JSON.stringify(res));
        this.setState({
          // filePath: res,
          // fileData: res.data,
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
      // console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        const source = {uri: res.uri};
        // console.log('response', JSON.stringify(res));
        this.setState({
          // filePath: res,
          // fileData: res.data,
          image: res.uri,
        });
      }
    });
  };

  uploadImageAsync = async (uri, storageRef) => {
    // const parts = uri.split(".");
    // const fileExtenstion = parts[parts.length - 1];

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
    const ref = storageRef
      .child('EmployeeImages')
      .child(uuid.v4() + '.' + fileExtenstion);
    const snapshot = await ref.put(blob);

    //close blob
    blob.close();
    return await snapshot.ref.getDownloadURL();
  };

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <ScrollView>
          <View style={styles.container}>
            <Form>
              <Item style={styles.inputItem}>
                <Label>First Name</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={(fName) => this.setState({fName})}
                  value={this.state.fName}
                />
              </Item>
              <Item style={styles.inputItem}>
                <Label>Last Name</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={(lName) => this.setState({lName})}
                  value={this.state.lName}
                />
              </Item>
              <Item style={styles.inputItem}>
                <Label>Phone</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={(phone) => this.setState({phone})}
                  value={this.state.phone}
                />
              </Item>
              <Item style={styles.inputItem}>
                <Label>Email</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={(email) => this.setState({email})}
                  value={this.state.email}
                />
              </Item>
              <Item style={styles.inputItem}>
                <Label>Address</Label>
                <Input
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType="default"
                  onChangeText={(address) => this.setState({address})}
                  value={this.state.address}
                />
              </Item>
            </Form>
            <Button
              full
              rounded
              style={styles.button}
              onPress={() => {
                this.updateEmployee(this.state.key);
              }}>
              <Text style={styles.buttonText}>Update</Text>
            </Button>
          </View>
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
});

export default EditEmployeeScreen;
