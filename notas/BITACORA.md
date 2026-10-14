# Bitacora de JavaScript interactivo 
  
Laboratorio 08: JavaScript Interactivo - DOM, Eventos y Objetos. 
Navegador usado: (escribe aqui cual usaste) 
  
## Ejercicio 2: Seleccionar y modificar el DOM 
| Instruccion | Que cambio en la pantalla | Se mantiene al recargar (Si/No) |
 |-------------|---------------------------|---------------------------------| 
| textContent desde la consola | Cambio el contenido del titulo y su color | si |
| textContent desde app.js | Cambia el titulo por "Hola Tecsup"| si | 
| style.color | Cambia el titulo de color a azul | si | 
| classList.add | añade una lista  | si| 
| createElement + appendChild | Se agrego javascript en ejercicio 2|si | 

  
## Ejercicio 3: Evento click 
| Tipo de evento | Que accion lo dispara | Cuanto suma por accion |
 |----------------|-----------------------|------------------------| 
| click | Dar click con el mouse| 1 | 
| dblclick | Dar doble click con el mouse|0 | 
| mouseover | Pasar por encima el mouse |1 | 

  
## Ejercicio 4: Eventos input y submit 
| Prueba | Que paso en la pantalla | Se recargo la pagina (Si/No) |
 |--------|-------------------------|------------------------------| 
| Escribir en el campo nombre | Al costado de hola se escribira el nombre que ingreso | no | 
| Enviar sin preventDefault | se recargo y se reseteoa default | si | 
| Enviar con preventDefault, correo sin @ | no se recargo y me mando mensaje de falta @ | no | 
| Enviar con preventDefault, correo con @ | se envio el correo y no se recargo la pagina | no | 

## Ejercicio 5: Clases y objetos 
| Objeto | nombre | precio | descripcion() | conDescuento(0.25) |
|--------|--------|--------|---------------|--------------------| 
| laptop | Laptop | S/2500.00 |'Laptop - S/ 2500.00' | S/2250.00 | 	
| mouse | mouse | S/45.00| 'Mouse - S/ 45.00'|S/40.50 | 
| teclado | Teclado | S/120.00| 'Teclado - S/ 120.00'|S/108.00 | 
| monitor | Monitor | S/680.00| 'Monitor - S/ 680.00'|S/612.00 | 	

## Ejercicio 6: DOM, eventos y objetos juntos 
| Prueba | Total que muestra la pagina | Correcto (Si/No) |
 |--------|-----------------------------|------------------| 
| Cuaderno 12.50 | 12.50 | si | 
| + Lapicero 3.20 | 15.70 | si | 
| + Mochila 89.90 | 105.60 | si | 
| Sin Number() | 0 | no | 
  
| Pieza | Linea de tu codigo donde aparece | Para que sirve |
 |-------|----------------------------------|----------------| 
| DOM |const formProducto = document.querySelector("#formProducto");  | | 
| Evento |formProducto.addEventListener("submit", (evento) => {   evento.preventDefault();  | | 
| Objeto | class Carrito {   constructor() {     this.items = []; } | | 
