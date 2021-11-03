/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  DeviceEventEmitter,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {
    BleManager,
    BleError,
    Device,
    State,
    LogLevel,
} from 'react-native-ble-plx';

import {
Log,
} from 'react-native-android-log'

let manager = new BleManager();
manager.setLogLevel(LogLevel.Verbose);

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

function getServicesAndCharacteristics(device){
    return new Promise((resolve, reject) => {
        device.services().then(services => {
            const characteristic = []
            console.log("kermith", services)
            services.forEach((service, i) => {
                service.characteristics().then(c => {
                    console.log(service.characteristic)

                    characteristic.push(c)
                    console.log(characteristic)
                    if(i == service.lenght - 1) {
                        const temp = characteristic.reduce(
                            (acc, current) => {
                                return [...acc, ...current]
                            },
                            []
                        )
                        const dialog = temp.find(
                            characteristic => characteristic.isWritableWithoutResponse
                        )
                        if(!dialog) {
                            reject('No writable characteristics')
                        }
                        resolve(dialog)
                    }
                })
            })
        })
    })
}

async function ScanAndConnect() {
    manager.startDeviceScan(
        null,
        null,
        (error, scannedDevice) => {
            if (error) {
                console.log('Scan error', error)
                return;
            }
            if (scannedDevice != null && scannedDevice.localName === 'ESP_SPP_SERVER') {
                console.log('Scan Ble')
                console.log(scannedDevice.localName)
                stopScan();
            }

            manager.connectToDevice(scannedDevice.id, {autoConnect:true}).then((scannedDevice) => {
                (async () => {
                    const services = await scannedDevice.discoverAllServicesAndCharacteristics()
                    const characteristic = await getServicesAndCharacteristics(services)
                    console.log('characteristic')
                    console.log(characteristic)
                    console.log("Discovering characteristics and services", characteristic.uuid);
                })();
                return scannedDevice.discoverAllServicesAndCharacteristics()
            }).then((scannedDevice) => {
                //
            }).then(() => {
                console.log('Listening')
            }, (error) => {
                console.log(error)
            })
            console.log('connected');
        }
    );
}

async function SendCommand(code, message) {
    console.log('sending code ', code, ' message ', message)

    
}

function testfunc() {
    console.log('Scanned not null');
    
}

function stopScan() {
    console.log('Stopping scan');
    manager.stopDeviceScan();
}

const App: () => Node = () => {
    console.log('Starting BLE sample App')

    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      };

    manager.enable();

    return (
        <SafeAreaView 
            style={backgroundStyle}>
        <ScrollView 
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
        <View
            style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}>
            <Section title="Section Title">
                Section Title
                <Text> Text </Text>
            </Section>
            {/* <Button onPress={TestFunction} title="Cmd1"/> */}
            <Button block onPress={ScanAndConnect} title="scandevices"/>
            <Button onPress={stopScan} title="StopScan"/>
            <Button onPress={()=>SendCommand("test", "message")} title="send cmd"/>
        </View>
        </ScrollView>
        </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App