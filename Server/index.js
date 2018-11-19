const SerialPort = require('serialport');

const parser = SerialPort.parsers.Readline;

const port = new SerialPort('COM3',{
    baudRate: 9600
});

const parser = port.pipe(new ReadLine({ delimiter: '\r\n' }));

parser.on('open', function(){
    console.log('connection is opened');
});

parser.on('data',function(){
    console.log(data);
});

port.on('error', function(err){
    console.log(err);
});