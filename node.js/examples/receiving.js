/*=============================================================================
 |      Editors:  Martyn Fitzgerald - 16025948
 |                Dawid Koleczko    - 17024154
 |
 |  Module Code:  UFCFVK-15-2
 | Module Title:  Internet Of Things
 |
 |   Instructor:  Benedict R. Gaster
 |     Due Date:  29/03/2019
 |
 |  Description:  This file deals with connecting the microbit with node js
 |                and sending over the data with bluetooth to our index.html
 |                page which displays these results. The data we take from the 
 |                microbit is the X,Y,Z,ROLL and the pitch from the accelerometer 
 |                reading.
 |
 *===========================================================================*/
var noble = require('../index');

const http = require('http');
var url = require('url');
var fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
var x, y, z, pitch, roll, newX, newY, newZ, score, ifServiceRunning;
var text = 'STARTING';

/*
  To specify we want to connect to one of these microbits
*/
var MICROBIT_ADDRESS = ['ec:28:ea:eb:b7:42','f1:38:b2:de:0c:c4'];

function swap32(val)
{
  return ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF);
}

noble.on('stateChange', function(state) 
{
  /* 
    If it the script is powered on start scanning otherwise stop
  */
  if (state === 'poweredOn') 
  {
    noble.startScanning();
  } 
  else 
  {
    noble.stopScanning();
  }
});
/*
  Function to discover devices
*/
noble.on('discover', function(peripheral) 
{
  /*
    if these none of the two addresses is found then stop scanning
  */
  if ( peripheral.address === MICROBIT_ADDRESS[0] || peripheral.address === MICROBIT_ADDRESS[1])
  {
    noble.stopScanning();
    peripheral.connect(function(error) 
    {
      /*
      peripheral.discoverServices(['E95DD91D251D470AA062FA1922DFA9A8'.toLowerCase()], function(error, services) 
      {
        services[0].discoverCharacteristics(['E95D93EE251D470AA062FA1922DFA9A8'.toLowerCase()], function(error, characteristics) 
        {
          
          characteristics[0].write(new Buffer(text ,'utf8'), true, function(error) 
          {
            console.log('Sending text : ' + text);
          });
          
          
          characteristics[0].subscribe(function(error) 
          {
            console.log("Subscribed to LED Screen");
          });
        });
      });
      */

      peripheral.discoverServices(['e95d0753251d470aa062fa1922dfa9a8'.toLowerCase()], function(error, services) 
      {
        services[0].discoverCharacteristics(['e95dca4b251d470aa062fa1922dfa9a8'.toLowerCase()], function(error, characteristics) 
        {
          /*
            Taking the data from the accelerometer deconding, reading and smoothing 
            it to improove the quallity of data that is sent through
          */
          characteristics[0].on('data', function(data, isNotification) 
          { 
            /*
              set x y z
            */
            newX = data[0] | (data[1] << 8);
            newY = data[2] | (data[3] << 8);
            newZ = data[4] | (data[5] << 8);

            if(newX & (1 << 16 - 1))
            {    
              newX = newX - (1<<16); 
            }
            if(newY & (1 << 16 - 1))
            {
              newY = newY - (1<<16); 
            }
            if(newZ & (1 << 16 - 1))
            {
              newZ = newZ - (1<<16); 
            }
            /*
              To get a smaller number rather than a huge number of numbers
            */
            x = newX / 1000.0;
            y = newY / 1000.0;
            z = newZ / 1000.0;
        
            pitch = Math.atan(data[0] / Math.sqrt(Math.pow(data[1], 2) + Math.pow(data[2], 2)));
            roll = Math.atan(data[1] / Math.sqrt(Math.pow(data[0], 2) + Math.pow(data[2], 2)));
            /*
              Converting into degrees
            */
            pitch = pitch * (180.0 / Math.PI);
            roll = -1 * roll * (180.0 / Math.PI);
        
          });
          /* 
            To enable notify so that we recive new data as the data keeps on changing every second
          */
          characteristics[0].subscribe(function(error) 
          {
            console.log("Subscribed to Accelometor");
          });
        });
      });
    });
  } 
});

/*
  Converting the results from the microbit into a JSON format. Creating an
  API to store the data and sending the data to the indoex.html file.
*/
const server = http.createServer((req, res) => 
{
  var pathname = url.parse(req.url).pathname;
  switch(pathname){
      case '/api':
        res.writeHead(200, {'Content-Type': 'application/json'});
       
        res.write(JSON.stringify({ X: x, Y:y, Z:z, PITCH:pitch, ROLL:roll, NEW_X:newX, NEW_Y:newY, NEW_Z:newZ}));
      
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
/*
  Keep checking for score within url

server.on('request', function(request, response) 
{
  response.writeHead(200);

  if (request.headers.referer != "http://127.0.0.1:3000/")
  {
    var str = request.headers.referer
    score = str.substr(str.indexOf("=") + 1);
    //console.log(score);
  }
});

  Run the node js server
*/
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});