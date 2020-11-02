
// Объект загрузки файла.
const file = document.getElementById("file-id");

// Изображение.
const img = document.getElementById("img-id");

// Кнопка обработать.
const but = document.getElementById("but");

// Время
const t1= document.getElementById("t1");
const t2 = document.getElementById("t2");



function fun() {

    // Создаем канвас.
    const canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    // Копируем изображение в канвас.
    ctx.drawImage(img, 0, 0);


    // Получаем данные о точках.
    var imgData = ctx.getImageData(0, 0, img.width, img.height);

        
        (async () => {

            var time = performance.now();

            var LEN = 4 * 1000 * 4;
            for (var j = 0; j < 1000 * 1000 * 4; j += LEN) {

                // Копируем массив байт.
                var data = imgData.data.slice(j, j + LEN - 1);

                    const res = await fetch('Home/Make', { method: 'POST', body: data });
                    const arr = await res.arrayBuffer();
                    var byteArray = new Uint8Array(arr);
                    for (var i = 0; i < byteArray.byteLength; i++) {
                        imgData.data[j + i] = byteArray[i];
                    }
                };

            time = performance.now() - time;
            t2.value = '' + time;

            // Подмена данных о точках.
            ctx.putImageData(imgData, 0, 0);
            // Подмена изображения.
            img.src = canvas.toDataURL("image/png");

        })();





}; // fun



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
    var s = 2;

    var time = performance.now();



    // По всем точкам изображения.
    for (var i = s; i < img.height - s; i++) {
        for (var j = s; j < img.width - s; j++) {
            // Количество точек в окрестности.
            var mn = Math.pow(2 * s + 1, 2); 

            // По окрестности точки (i,j).
            var sr = 1.0;
            var sg = 1.0;
            var sb = 1.0;

            // Применяем среднегармонический фильтр.
            for (var p = i - s; p <= i + s; p++) {
                for (var q = j - s; q <= j + s; q++) {
                    var r = data[p * img.width * 4 + q * 4 + 0];
                    var g = data[p * img.width * 4 + q * 4 + 1];
                    var b = data[p * img.width * 4 + q * 4 + 2];

                    sr *= r;
                    sg *= g;
                    sb *= b;
                }
            }          

            var fr = Math.pow (sr, 1.0/mn);
            var fg = Math.pow(sg, 1.0 / mn);
            var fb = Math.pow(sb, 1.0 / mn);

            imgData.data[i * img.width * 4 + j * 4 + 0] = fr;
            imgData.data[i * img.width * 4 + j * 4 + 1] = fg;
            imgData.data[i * img.width * 4 + j * 4 + 2] = fb;
            // imgData.data[i * img.width * 4 + i * 4 + 3] - Альфа-канал (0-255; 0 - прозрачный, 255 - полностью видимый).
        }
    }


    time = performance.now() - time;
    t1.value = '' + time;


    // Подмена данных о точках.
    ctx.putImageData(imgData, 0, 0);
    
    // Подмена изображения.
    img.src = canvas.toDataURL("image/png");
});
