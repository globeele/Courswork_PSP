// Объект загрузки файла.
const file = document.getElementById("file-id");

// Изображение.
const img = document.getElementById("img-id");

// Кнопка обработать.
const but    = document.getElementById("but");

// Событие загрузки файла.
file.addEventListener("change", function () {
    var reader = new FileReader();
    reader.onload = function (e) {      
        img.src = e.target.result;
    }
    reader.readAsDataURL(this.files[0]);
});

// Событие нажатия кнопки "Обработать".
but.addEventListener("click", function () {

    // Создаем канвас.
    const canvas = document.createElement("canvas");        
    var ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    // Копируем изображение в канвас.
    ctx.drawImage(img, 0, 0);

    // Получаем данные о точках.
    var imgData = ctx.getImageData(0, 0, img.width, img.height);

    // Копируем массив байт.
    var data = imgData.data.slice();

    // Радиус окрестности точки.
    var s = 3;

    // По всем точкам изображения.
    for (var i = s; i < img.height - s; i++) {
        for (var j = s; j < img.width - s; j++) {
            // Количество точек в окрестности.
            var mn = Math.pow(2 * s + 1, 2); 

            // По окрестности точки (i,j).
            var sr = 0.0;
            var sg = 0.0;
            var sb = 0.0;

            // Применяем среднегармонический фильтр.
            for (var p = i - s; p <= i + s; p++) {
                for (var q = j - s; q <= j + s; q++) {
                    var r = data[p * img.width * 4 + q * 4 + 0];
                    var g = data[p * img.width * 4 + q * 4 + 1];
                    var b = data[p * img.width * 4 + q * 4 + 2];

                    sr += 1.0 / r;
                    sg += 1.0 / g;
                    sb += 1.0 / b;
                }
            }          

            var fr = mn / sr;
            var fg = mn / sg;
            var fb = mn / sb;

            imgData.data[i * img.width * 4 + j * 4 + 0] = fr;
            imgData.data[i * img.width * 4 + j * 4 + 1] = fg;
            imgData.data[i * img.width * 4 + j * 4 + 2] = fb;
            // imgData.data[i * img.width * 4 + i * 4 + 3] - Альфа-канал (0-255; 0 - прозрачный, 255 - полностью видимый).
        }
    }

    // Подмена данных о точках.
    ctx.putImageData(imgData, 0, 0);
    
    // Подмена изображения.
    img.src = canvas.toDataURL("image/png");
});



//
// This example shows a simple TCP echo client.
// The client will send "Hello World" to the server on port 6789 and log
// what has been received from the server.
//

//  Request permission to connect to server at address 127.0.0.1 on port
//  6789



navigator.tcpPermission.requestPermission({ remoteAddress: "127.0.0.1", remotePort: 6789 }).then(
    () => {
        // Permission was granted
        // Create a new TCP client socket and connect to remote host
        var mySocket = new TCPSocket("127.0.0.1", 44354);

        // Send data to server
        mySocket.writeable.write("Hello World").then(
            () => {

                // Data sent sucessfully, wait for response
                console.log("Data has been sent to server");
                mySocket.readable.getReader().read().then(
                    ({ value, done }) => {
                        if (!done) {
                            // Response received, log it:
                            console.log("Data received from server:" + value);
                        }

                        // Close the TCP connection
                        mySocket.close();
                    }
                );
            },
            e => console.error("Sending error: ", e);
    );

// Signal that we won't be writing any more and can close the write half of the connection.
mySocket.halfClose();

// Log result of TCP connection attempt.
mySocket.opened.then(
    () => {
        console.log("TCP connection established sucessfully");
    },
    e => console.error("TCP connection setup failed due to error: ", e);
    );

// Handle TCP connection closed, either as a result of the webapp
// calling mySocket.close() or the other side closed the TCP
// connection or an error causing the TCP connection to be closed.
mySocket.closed.then(
    () => {
        console.log("TCP socket has been cleanly closed");
    },
    e => console.error("TCP socket closed due to error: ", e);
    );
  },
e => console.error("Connection to 127.0.0.1 on port 6789 was denied
                     due to error: ", e);
);