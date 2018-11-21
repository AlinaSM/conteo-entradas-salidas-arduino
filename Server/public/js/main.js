const socket = io();


socket.on('sql',function(data){
    console.log(data);
    
});

