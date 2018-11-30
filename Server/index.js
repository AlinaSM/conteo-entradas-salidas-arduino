// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.net/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getThisWeek = function(thisTime = "") {
    if(thisTime == ""){
        var date = new Date(this.getTime());
        date.setHours(0, 0, 0, 0);
    }else{
        var date = new Date(thisTime);
        date.setHours(0, 0, 0, 0);
    }
    
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  var tiempo = new Date();   
  var diasDelaSemana = ['Lunes','Martes', 'Miercoles', 'Jueves','Viernes', 'Sabado'];
  var mesesDelAnio = ['Enero','Febrero', 'Marzo', 'Abril','Mayo', 'Junio',
                      'Julio','Agosto', 'Septiembre', 'Octubre','Noviembre', 'Diciembre'];
  
//Conexion a mySql
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_puerta_arduino'
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


const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

app.use(express.static(__dirname + '/public'));

io.on("mensajeRecibido", function(data){
    console.log(data);
    io.emit("mostrarMensaje", data);

});

server.listen(3000, function(){
    console.log('Server listening on port ', 3000);
});

io.on("connection", function(socket){
    
    socket.on('parametrosGraficar', function(data){
        
        let consulta;
        let numeroSemana = tiempo.getThisWeek(data['mesSeleccionado']+" "+data['diaSeleccionado']+", "+data['anioSeleccionado']+" 0:0:0");
        if(data['tiempoGraficar'] == "dia"){
            consulta = "SELECT hora AS tiempoMedir , count(estado) AS frecuencia FROM puerta WHERE dia = "+data['diaSeleccionado']+
                        " AND mes = '"+mesesDelAnio[data['mesSeleccionado'] - 1]
                        +"' AND estado like 'entrada%' GROUP BY hora;";
        }else if( data['tiempoGraficar'] == "semana" ){
            consulta = "SELECT dia_semana AS tiempoMedir, count(estado) AS frecuencia FROM puerta WHERE numero_semana = '"+numeroSemana+
                        "' and estado like 'entrada%'GROUP BY dia_semana;";
        }else if( data['tiempoGraficar'] == "mes" ){
            consulta =  "SELECT dia_semana AS tiempoMedir, count(estado) AS frecuencia FROM puerta "+
                            "WHERE mes = '"+mesesDelAnio[data['mesSeleccionado'] - 1]+"' and estado like 'entrada%' "+
                            "GROUP BY dia_semana;";
        }

        connection.query(consulta, function (err, result, fields) {
            if (err) throw err;
            //console.log(result);
            io.emit('infoMostrar', result);
          });

        
    });

});


//Serial comunication 
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

const port = new SerialPort('COM3',{
    baudRate: 9600
});

const parser = port.pipe(new Readline({ delimeter: '\r\n' }));

parser.on('open', function(){
    console.log('connection is opened');
});

parser.on('data',function(data){
    
/*
    */
   // console.log(data);

    if( isNaN(data) ){
        let sql = "INSERT INTO `puerta` (`estado`, `dia_semana`, `dia`, `mes`, `anio`, `hora`, `minuto`,"+
              " `segundo`, `numero_semana`) \n VALUES ('"+data+"', '"+ diasDelaSemana[tiempo.getDay() - 1] +
              "', "+tiempo.getDate()+", '"+ mesesDelAnio[tiempo.getMonth()] + "',"+tiempo.getFullYear()+", "+
              ( tiempo.getHours() + 1 )+", "+ tiempo.getMinutes() +", "+ tiempo.getSeconds() +","+tiempo.getThisWeek()+");";
              
    connection.query(sql, function(error, result){
        if(error)
            throw error;
        //console.log('Dato insertado: '+ tiempo.getThisWeek(mes+" "+6+", "+2018+" 0:0:0"));
    });
    
    io.emit('sql', sql);
    }
    
});

port.on('error', function(err){
    console.log('Error: '+ err);
});