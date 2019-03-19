var noble = require('../index');

const http = require('http');
var url = require('url');
var fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
var x, y, z;

var MICROBIT_ADDRESS = ['ec:28:ea:eb:b7:42','f1:38:b2:de:0c:c4'];

noble.on('stateChange', function(state) 
{
  if (state === 'poweredOn') 
  {
    noble.startScanning();
  } 
  else 
  {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) 
{
  if ( peripheral.address === MICROBIT_ADDRESS[0] || peripheral.address === MICROBIT_ADDRESS[1])
  {
  noble.stopScanning();
  peripheral.connect(function(error) 
  {
    peripheral.discoverServices(['e95d0753251d470aa062fa1922dfa9a8'], function(error, services) 
    {
      services[0].discoverCharacteristics(['e95dca4b251d470aa062fa1922dfa9a8'], function(error, characteristics) 
      {
        var accelerometerCharacteristic = characteristics[0];

        accelerometerCharacteristic.on('data', function(data, isNotification) 
        {	  
          x = data.readInt8(0) / 16.0;
          y = data.readInt8(2) / 16.0;
          z = data.readInt8(1) / 16.0;
        });

        // to enable notify
        accelerometerCharacteristic.subscribe(function(error) {
          console.log('Accelerometer notification on');
        });
      });
    });
  });
  } 
});


const server = http.createServer((req, res) => 
{
  var pathname = url.parse(req.url).pathname;
  switch(pathname){
      case '/api':
        res.writeHead(200, {'Content-Type': 'application/json'});
       
        res.write(JSON.stringify({ X: x, Y:y, Z:z }));
      
        return res.end();
      break;
      default:
        fs.readFile('index.html', function(err, data) 
        {
            res.writeHead(200, {'Content-Type': 'text/html'});
            
            res.write(data);
          
            return res.end();
        });
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});