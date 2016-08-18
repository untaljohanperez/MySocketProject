var http = require("http");  
var url = require('url');  
var fs = require('fs');  
var io = require('socket.io');  
var port = process.env.port || 1337;  
var server = http.createServer(function(request, response) {  
    var path = url.parse(request.url).pathname;  
    switch (path) {  
        case '/':  
            response.writeHead(200, {  
                'Content-Type': 'text/html'  
            });  
            response.write('hello world');  
            response.end();  
            break;  
        case '/Index.html':  
            fs.readFile(__dirname + path, function(error, data) {  
                if (error) {  
                    response.writeHead(404);  
                    response.write("page doesn't exist - 404");  
                    response.end();  
                } else {  
                    response.writeHead(200, {  
                        "Content-Type": "text/html"  
                    });  
                    response.write(data, "utf8");  
                    response.end();  
                }  
            });  
            break;
        case '/Scripts/Controllers/ProcessManagerController.js':  
            fs.readFile(__dirname + path, function(error, data) {  
                if (error) {  
                    response.writeHead(404);  
                    response.write("page doesn't exist - 404");  
                    response.end();  
                } else {  
                    response.writeHead(200, {  
                        "Content-Type": "text/javascript"  
                    });  
                    response.write(data, "utf8");  
                    response.end();  
                }  
            });  
            break; 
        case '/socketAngular.js':  
            fs.readFile(__dirname + path, function(error, data) {  
                if (error) {  
                    response.writeHead(404);  
                    response.write("page doesn't exist - 404");  
                    response.end();  
                } else {  
                    response.writeHead(200, {  
                        "Content-Type": "text/javascript"  
                    });  
                    response.write(data, "utf8");  
                    response.end();  
                }  
            });  
            break; 
        default:  
            response.writeHead(404);  
            response.write("page this doesn't exist - 404");  
            response.end();  
            break;  
    }  
});  
server.listen(port);
console.log('Server listenning in port: ' + port + '...');
var listener = io.listen(server);  

var processList = [];
var readyStatus = "ready";
var runningStatus = "running"; 
var waitingStatus = "waiting"; 
var terminatedStatus = "terminated";

var sendProcessList = function(socket){
    socket.emit('sendProcessList', processList);
    socket.broadcast.emit('sendProcessList', processList);   
};

listener.sockets.on('connection', function(socket) {  
    //Send Data From Server To Client  
    socket.emit('sendProcessList', processList);

    socket.on('sendProcessList', function(data){
        processList = data;
        socket.broadcast.emit('sendProcessList', processList);
    });      

    //Receive Data From Client  
    socket.on('newProcess', function(data) {
        data.id = processList.length + 1;  
        data.status = readyStatus;
        data.remainingTime = data.processingTime; 
        processList.push(data);

        sendProcessList(socket);
        socket.broadcast.emit('postNewProcessSuccess', null);  
        process.stdout.write(data.process + ': ' + data.processingTime);  
    });

    socket.on('updateProcess', function(data){
        processList.forEach(function(processs){
            if(processs.id == data.id){
                processs.status = data.status;
                processs.remainingTime = data.remainingTime;
                return;
            }
        });
        socket.emit('sendProcessList', processList);
    });  

});

 
