//Conexion a mySql
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'arduino-puerta'
});

connection.connect(function(error){
    if(!!error){
        console.log('Error');
    }else{
        console.log('Connected');
    }
});

//Parte del servidor
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
var date = new Date();

const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

app.use(express.static(__dirname + '/public'));


server.listen(3000, function(){
    console.log('Server listening on port ', 3000);
});


//Serial comunication 
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
    let tiempo = new Date();

    let diasDelaSemana = ['Lunes','Martes', 'Miercoles', 'Jueves','Viernes', 'Sabado'];
    let mesesDelAnio = ['Enero','Febrero', 'Marzo', 'Abril','Mayo', 'Junio',
                        'Julio','Agosto', 'Septiembre', 'Octubre','Noviembre', 'Diciembre'];
    
    let sql = "INSERT INTO `puerta` (`estado`, `dia_semana`, `dia`, `mes`, `anio`, `hora`, `minuto`,"+
              " `segundo`) VALUES ('"+data+"', '"+ diasDelaSemana[tiempo.getDay() - 1] +
              "', "+tiempo.getDate()+", '"+ mesesDelAnio[tiempo.getMonth()] + "',"+tiempo.getFullYear()+", "+
              ( tiempo.getHours() + 1 )+", "+ tiempo.getMinutes() +", "+ tiempo.getSeconds() +");";
    
    connection.query(sql, function(error, result){
        if(error)
            throw error;
        console.log('Dato insertado: '+ data);
    });
    
    //io.emit('sql', sql);
    
});

port.on('error', function(err){
    console.log('Error: '+ err);
});