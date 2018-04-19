# NodeJS-WebSocket-Server

node_websocket_server.js -> NodeJS üzerinde çalışacak olan websocket sunucusu

Device.html -> Dronlara bağlı olan android uygulamasını temsil etmektedir.

Client.html -> Sunucu tarafının arayüzünü temsil etmektedir.

Server üzerinde
listDevice ve listClient adlı 2 liste bulunmaktadır.
Bu listeler server üzerinde atanan id değerleri ile eşleştirilerek sunucuda tutulmaktadır.
sunucuya yeni bir drone bağlandığında, tüm clientlere bağlanan drone'un id si gönderilir.
**Daha sonra bağlanan clientlere önceden bağlı drone'ların id bilgisinin gönderilmesi gerekmekte(şimdilik önemsiz).

Client -> NodeJS-WebSocketServer -> Device

Client tarafı aşağıdaki formatta veriyi -id- key'inde belirtilen drona gönderecektir.
Data Format: JSON
{
  'id': 0,
  'msg': 'deneme',
  'yaw': 0.05,
  'pitch': 0.06,
  'roll': 0.07,
  'throttle': 0.08
}
