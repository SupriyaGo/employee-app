import React, {Component} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native';
import {Card} from 'native-base';

export default class EmployeeList extends Component {
  render() {
    return (
      <FlatList
        data={this.props.ListData}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('View', {
                  key: item.key,
                });
              }}>
              <Card style={styles.listItem}>
                <View>
                  <Image
                    style={styles.contactIcon}
                    source={
                      item.imageUrl === 'empty'
                        ? require('./../../assets/person.png')
                        : {uri: item.imageUrl}
                    }
                  />
                </View>
                <View style={styles.iconContainer}>
                  <Text style={styles.employeeIcon}>
                    {employee.fName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    {employee.fName} {employee.lName}
                  </Text>
                  <Text style={styles.infoText}>{employee.phone}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => item[0].toString()}
      />
    );
  }
}

const styles = StyleSheet.create({
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  listItem: {
    flexDirection: 'row',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A79DF',
    borderRadius: 100,
  },
  employeeIcon: {
    fontSize: 28,
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'column',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '400',
    paddingLeft: 10,
    paddingTop: 2,
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
