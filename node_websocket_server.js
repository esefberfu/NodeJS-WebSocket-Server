const WebSocket = require('ws');

var listDevice = {}; // drone listesi
var listClient = {}; // masaüstü veya diğer bilgisayarların tutuldu liste
var id_counter = 0;  // id bilgisi tutuluyor şimdilik geçici id'ler atanıyor. Daha sonrasında

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws, req) {
    if(req.url === '/device')
    {
        device(ws);
    }
    else if(req.url === '/client')
    {
        client(ws);
    }
    else if(req.url === '/data')
    {
        data(ws);
    }
    else
    {
        ws.close();
    }

});

function device(ws) {
    //bir drone bağlandığında bilgisi tüm client'lere gönderilecek.
    listDevice[id_counter] = ws;
    console.log((new Date()) + ' Connection accepted. DEVICE-ID: ' + id_counter);

    ws.on('message', function(message) {
        console.log('DEVICE - Received Message: ' + message.utf8Data);
    });

    ws.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + ws.remoteAddress + ' disconnected.');
    });

    for(i = 0; i<Object.keys(listClient).length; i++)
    {
        var key = Object.keys(listClient)[i];
        console.log('id: '+ key);
        var client = listClient[key];
        var data = {'new-device':id_counter};
        client.send(JSON.stringify(data));
    }
    id_counter++;

}

function client(connection) {
    listClient[id_counter] = connection;
    console.log((new Date()) + ' Connection accepted. CLIENT-ID: ' + id_counter);
    id_counter++;

    connection.on('message', function (message) {
        console.log(message);
        // JSON Data = { target:'', msg:'', throttle:'', yaw:'', pitch:'', roll:'' };
        var obj = JSON.parse(message);
        var id = obj['id'];
        var msg = obj['msg'];
        var yaw = obj['yaw'];
        var pitch = obj['pitch'];
        var roll = obj['roll'];
        var throttle = obj['throttle'];

        //hedef socket(Drone) seçiliyor ve bilgiler gönderiliyor.
        var target = listDevice[id];
        console.log('target secildi.');

        target.send(message);
    });
}
