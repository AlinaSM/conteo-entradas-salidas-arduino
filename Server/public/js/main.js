const socket = io();

socket.on('infoMostrar',function(data){
    console.log(data);
});

socket.on("mostrarParametros", function(data){
    console.log(data);
})

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
