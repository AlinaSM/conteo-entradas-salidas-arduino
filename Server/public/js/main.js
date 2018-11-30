const socket = io();

socket.on('infoMostrar',function(data){
    console.log("Infor mostrar: ",data);
    var ctx = document.getElementById("miGrafica").getContext('2d');
    var labelsDatos = [];
    var dataFrecuencia = [];

    for( i = 0; i<data.length; i++){
        labelsDatos.push(data[i].tiempoMedir);
        dataFrecuencia.push(data[i].frecuencia);
    };
    
    console.log(labelsDatos);
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labelsDatos,
            datasets: [{
                label: 'Frecuencia',
                data:dataFrecuencia ,
                backgroundColor: 'rgb(71, 71, 193, 0.3)',
                borderColor: 'rgb(31, 31, 84, 0.25)',
                borderWidth: 3
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
});

socket.on("mostrarParametros", function(data){
    console.log(" Hola:  ",data);
    
});

socket.on('sql',function(data){
    console.log(data);
});

function infoMostrar(event){
    let fechaSelecionada = document.getElementById('calendario').value;
    var precargando = {
        tiempoGraficar  : document.getElementById('selTiempo').value,
        mesSeleccionado : fechaSelecionada.substr(0,2),
        diaSeleccionado : fechaSelecionada.substr(3,2),
        anioSeleccionado: fechaSelecionada.substr(6,4)
    };

    socket.emit('parametrosGraficar', precargando);
    return false;
}
