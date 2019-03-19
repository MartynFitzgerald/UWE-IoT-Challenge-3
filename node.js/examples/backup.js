var noble = require('../index');

//var FOUND_MICROBIT_ADDR1 = 'ec:28:ea:eb:b7:42';
/*
peripheral discovered (ec28eaebb742 with address <ec:28:ea:eb:b7:42, random>, connectable true, RSSI -62:
        hello my local name is:
                BBC micro:bit
        can I interest you in any of the following advertised services:
*/


noble.on('stateChange', function(state) {
  console.log('[1.stateChange] ' + state);
  
  if (state === 'poweredOn') {
      noble.startScanning();
  } else {
      noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
	console.log('peripheral discovered (' + peripheral.id +
              ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
              ' connectable ' + peripheral.connectable + ',' +
              ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));
 // console.log('[3.discover]\n' + peripheral);
 

 if (peripheral.address === 'ec:28:ea:eb:b7:42'){
	 
	 console.log("found");
	 noble.stopScanning();
/*	 
	  peripheral.connect(function(error) {
		console.log('connected to peripheral: ' + peripheral.uuid);
		peripheral.discoverServices(null, function(error, services) {
		  console.log('discovered the following services:');
		  for (var i in services) {
			console.log('  ' + i + ' uuid: ' + services[i].uuid);
		}
		});
	});
*/
/*
  0 uuid: 1800
  1 uuid: 1801
  2 uuid: 180a
  3 uuid: e95d0753251d470aa062fa1922dfa9a8
  4 uuid: e95d6100251d470aa062fa1922dfa9a8
*/
	
	
/*
	peripheral.connect(function(error) {
    console.log('connected to peripheral: ' + peripheral.uuid);
    peripheral.discoverServices(['e95d0753251d470aa062fa1922dfa9a8'], function(error, services) {
      var deviceInformationService = services[0];
      console.log('discovered device information service');

      deviceInformationService.discoverCharacteristics(null, function(error, characteristics) {
        console.log('discovered the following characteristics:');
        for (var i in characteristics) {
          console.log('  ' + i + ' uuid: ' + characteristics[i].uuid);
        }
      });
    });
  });
 */ 
  // 180a = 2a24,2a25,2a26
  //1800 = 2a00, 2a01, 2a04
  //1801 = 2a05
  //e95d93af251d470aa062fa1922dfa9a8 = 
  /*
  0 uuid: e95d9775251d470aa062fa1922dfa9a8
  1 uuid: e95d5404251d470aa062fa1922dfa9a8
  2 uuid: e95d23c4251d470aa062fa1922dfa9a8
  3 uuid: e95db84c251d470aa062fa1922dfa9a8
  */
/*
peripheral.connect(function(error) {
    console.log('connected to peripheral: ' + peripheral.uuid);
    peripheral.discoverServices(['e95d0753251d470aa062fa1922dfa9a8'], function(error, services) {
      var deviceInformationService = services[0];
      console.log('discovered device information service');

      deviceInformationService.discoverCharacteristics(['e95dca4b251d470aa062fa1922dfa9a8'], function(error, characteristics) {
        var manufacturerNameCharacteristic = characteristics[0];
        console.log('discovered manufacturer name characteristic');

        manufacturerNameCharacteristic.read(function(error, data) {
          // data is a buffer
		  console.log(data);
          console.log('manufacture name is: ' + data.toString('utf8'));
        });
      });
    });
  });

*/

peripheral.connect(function(error) {
    console.log('connected to peripheral: ' + peripheral.uuid);
    peripheral.discoverServices(['e95d0753251d470aa062fa1922dfa9a8'], function(error, services) {
      var batteryService = services[0];
	  ///var test = services[1];
      console.log('discoveredBatter service');

	 
	  
      batteryService.discoverCharacteristics(['e95dca4b251d470aa062fa1922dfa9a8'], function(error, characteristics) {
        var batteryLevelCharacteristic = characteristics[0];
		var test = characteristics[1];
		
		 //console.log(characteristics[0]);
        console.log('discovered Battery Level characteristic');
		
		
		
        batteryLevelCharacteristic.on('data', function(data, isNotification) {
        //  console.log('battery level is now: ', data.readUInt8(0) + '%');
		  
		  
		  var x = data.readInt8(0) / 16.0;
		   console.log('x: ',x);
		  
		  
		  var y = data.readInt8(1) / 16.0;
		   console.log('Y: ',y);
		  
          var z = data.readInt8(2) / 16.0;
		  console.log('z: ',z);
		  
        });

		
		
		
        // to enable notify
        batteryLevelCharacteristic.subscribe(function(error) {
          console.log('battery level notification on');
        });
		
		
		
		
      });
    });
  });
  
 }
 
  
});
