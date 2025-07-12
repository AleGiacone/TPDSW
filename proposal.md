### Integrantes

52147 - Aguirrezabala, Pilar

52664 - Giacone, Alessandro

### Repositorios

* [FrontEnd App](https://github.com/AleGiacone/FrontEnd)
* [BackEnd App](https://github.com/AleGiacone/BackEnd)

## Tema
### Descripción
Una aplicación web de "Petsbnb" la cual permite conectar dueños de mascotas y cuidadores de mascotas quienes ofrecen sus servicios de cuidado de mascotas por un periodo determinado. Dentro de su funcionamiento se contemplan tres tipos de usuarios principales. El usuario "Administrador" se encarga de supervisar el sistema en general, moderar aplicaciones y reportes con acceso a todos los datos; el tipo de usuario "Cuidador" puede registrar una o varias publicaciones donde ofrece su hogar y servicio de cuidado, definiendo qué tipo de animales acepta, por cuánto tiempo, si puede cuidar animales exóticos, condiciones especiales, tarifas y disponibilidad. Este recibe reservas por parte de los dueños y decide si las acepta o las rechaza; el "Dueño" quien registra a sus mascotas en el sistema con detalles relevantes (edad, especie, necesidades específicas, etc) y busca cuidadores según se adapte a las necesidades del animal teniendo la posibilidad de solicitar una reserva de una publicación determinando luego la fecha y realizando el pago de la misma.

### Modelo
![Modelo de Dominio](Petsbnb.png)

## Alcance Funcional
### Alcance Mínimo
Regularidad:
| Req  | Detalles |
|:-|:-|
| CRUD simple   | 1. CRUD Dueño <br> 2. CRUD Cuidador <br> 3. CRUD Administador|
| CRUD dependiente      | 1. CRUD Publicación {depende de} CRUD Cuidador <br> 2. CRUD Mascota {depende de} CRUD Dueño <br>  |
| Listado + detalles  | 1. Listado de publicaciones filtrado por atributo exótico => detalle muestra publicaciones de cuidadores |
| CUU | 1. Crear publicación |

Aprobación:
| Req  | Detalles |
|:-|:-|
| CRUD | 1. CRUD Reserva  <br> 2. CRUD Disponibilidad <br> 3. CRUD Tipo  <br> 3. CRUD Pago|
| CUU | 1. Crear publicación  <br> 2. Realizar reserva|
