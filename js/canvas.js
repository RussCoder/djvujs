"use strict";

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
c.lineWidth = 1;
c.beginPath();
/*c.moveTo(150, 100);
// Начать с середины верхнего края 
c.arcTo(200, 100, 200, 200, 40);
// Верхний край и закругленный правый верхний угол 
c.arcTo(200, 200, 100, 200, 30);
// Правый край и правый нижний угол с закруглением 
// меньшего радиуса 
c.arcTo(100, 200, 100, 100, 20);
// Нижний край и закругленный левый нижний угол 
c.arcTo(100, 100, 200, 100, 10);
// Левый край и закругленный левый верхний угол */
//c.fillRect(32, 32, 32, 32);
c.arc(48, 48,16, 0, Math.PI*2);
c.closePath();
c.fill();
// Нарисовать отрезок до начальной точки. 
c.stroke();
// Вывести контур 

/*c.beginPath();
c.moveTo(0, 0);
c.lineTo(100, 100);
c.strokeStyle = "red";
c.stroke();
c.closePath();*/

/*var img = document.createElement('img');
img.src = canvas.toDataURL();
document.body.appendChild(img);*/

var image = c.getImageData(0, 0, canvas.width, canvas.height);
console.log(image.data.length)

c.putImageData(image, 0, 0);

var button = document.createElement("button");
button.innerHTML = "Save";
button.onclick = function() {
    //window.open(canvas.toDataURL(), "Picture");
    var curLoc = document.getElementById("inputtext").value;
  //location.href = curLoc;
  //location.hash = curLoc;
  history.pushState({}, "Title", "/" + curLoc);
}

window.onhashcahnge = function(e) {
    e.preventDefault();
    console.log("456");
    return false;
}

var a = document.getElementById("saveBut");
a.href = canvas.toDataURL();

document.body.insertBefore(button, document.body.firstChild);


var newWin = window.open("about:blank", 'example', 'width=600,height=400');

    //lert(newWin.location.href); // (*) about:blank, загрузка ещё не началась

    newWin.onload = function() {

      // создать div в документе нового окна
      var div = newWin.document.createElement('div'),
        body = newWin.document.body;

      div.innerHTML = 'Добро пожаловать!'
      div.style.fontSize = '30px'

      // вставить первым элементом в body нового окна
      body.insertBefore(div, body.firstChild);
    }

    var div = newWin.document.createElement('div'),
        body = newWin.document.body;

      div.innerHTML = 'Добро пожаловать!'
      div.style.fontSize = '30px'

      // вставить первым элементом в body нового окна
      body.insertBefore(div, body.firstChild);