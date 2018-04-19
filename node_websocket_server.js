	var WebSocketServer = require('websocket').server;
	var http = require('http');

	var listDevice = {}; // drone listesi
	var listClient = {}; // masaüstü veya diğer bilgisayarların tutuldu liste
	var id_counter = 0;  // id bilgisi tutuluyor şimdilik geçici id'ler atanıyor. Daha sonrasında 

	var server = http.createServer(function(request, response) {
		console.log((new Date()) + ' Received request for ' + request.url);
		response.writeHead(404);
		response.end();
	});
	server.listen(8080, function() {
		console.log((new Date()) + ' Server is listening on port 8080');
	});

	wsServer = new WebSocketServer({
		httpServer: server,
		autoAcceptConnections: false
	});

	function originIsAllowed(origin) {
		// put logic here to detect whether the specified origin is allowed.
		return true;
	}

	// gelen bağlantılar işleniyor
	wsServer.on('request', function(request) {
		if (!originIsAllowed(request.origin)) {
			request.reject();
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
			return;
		}
		var connection = request.accept('echo-protocol', request.origin);
		var reqUrl = request.resourceURL;

		//device --> drone
		//client --> pc, desktop
		//data --> drone'daki veriler buraya gönderilecek, veriler alındıktan sonra soket kapatılacak
		//diğer durumlarda bağlantı sağlanmayacaktır.
		const path = reqUrl.path;
		if(path == '/device')
		{
			device(connection);
		}
		else if (path == '/data')
		{
			data(connection);
		}
		else if (path == '/client')
		{
			client(connection);
		}
		else
		{
			connection.close();
		}
	});

	function device(connection) {
		//bir drone bağlandığında bilgisi tüm client'lere gönderilecek.
		listDevice[id_counter] = connection;
		console.log((new Date()) + ' Connection accepted. DEVICE-ID: ' + id_counter);

		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				console.log('DEVICE - Received Message: ' + message.utf8Data);
				connection.sendUTF(message.utf8Data);
			}
			else if (message.type === 'binary') {
				console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
				connection.sendBytes(message.binaryData);
			}
		});
		connection.on('close', function(reasonCode, description) {
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		});		

		for(i = 0; i<Object.keys(listClient).length; i++)
		{
			var key = Object.keys(listClient)[i];
			console.log('id: '+ key);
			var client = listClient[key];
			var data = {'new-device':id_counter};
			client.sendUTF(JSON.stringify(data));
		}
		id_counter++;

	}

	function data(connection) {

		// buradaki veriler client'e bağlı tüm cihazlara gönderilecek. şimdilik boş.
		console.log((new Date()) + ' Connection accepted.');
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				console.log('DATA - Received Message: ' + message.utf8Data);
				connection.sendUTF(message.utf8Data);
			}
			else if (message.type === 'binary') {
				console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
				connection.sendBytes(message.binaryData);
			}
		});
		connection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		});
	}


	function client(connection) {
		listClient[id_counter] = connection;
		console.log((new Date()) + ' Connection accepted. CLIENT-ID: ' + id_counter);
		id_counter++;

		connection.on('message', function (message) {
		   if(message.type === 'utf8')
		   {
			   console.log(message.utf8Data);
			   // JSON Data = { target:'', msg:'', throttle:'', yaw:'', pitch:'', roll:'' };
			   var obj = JSON.parse(message.utf8Data);
			   var id = obj['id'];
			   var msg = obj['msg'];
			   var yaw = obj['yaw'];
			   var pitch = obj['pitch'];
			   var roll = obj['roll'];
			   var throttle = obj['throttle'];

			   console.log(JSON.stringify(obj));

				//hedef socket(Drone) seçiliyor ve bilgiler gönderiliyor.	
			   var target = listDevice[id];
			   console.log('target secildi.');

			   target.sendUTF(message.utf8Data);
		   }
		});
	}
