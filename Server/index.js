const SerialPort = require('serialport');

const Readline = SerialPort.parsers.Readline;

const port = new SerialPort('COM4',{
    baudRate: 9600
});

const parser = port.pipe(new Readline({ delimeter: '\r\n' }));

parser.on('open', function(){
    console.log('connection is opened');
});

parser.on('data',function(data){
    console.log(data);
});

port.on('error', function(err){
    console.log('Lol: '+ err);
});