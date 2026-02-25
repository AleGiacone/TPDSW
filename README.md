# TPDSW
Trabajo Práctico de Desarrollo de Software

Para poder correr este proyecto necesitaremos tener instalado NodeJs
https://nodejs.org/en/download

Para la correcta instalacón tanto del Backend como del Frontend debemos ejecutar en cada una de esas carpetas dos comando. En la carpeta Backend se debe ejecutar "pnpm install" para instalar las dependencias y su comando de ejecución "pnpm start:dev" y en otra terminal la carpeta Frontend se debe ejecutar "npm install" y luego "npm run dev". 

## Base de datos
 
Para nuestra base de datos vamos a utilizar la herramienta Docker, por lo tanto, debemos crear su contenedor.
Comando para la creación de la base de datos usando Docker:

docker run --name Petsbnb -v **RUTA**:/var/lib/mysql -e MYSQL_ROOT_HOST='%' -e MYSQL_ALLOW_EMPTY_PASSWORD="yes" -e MYSQL_PASSWORD="admin" -e MYSQL_USER="admin" -e MYSQL_DATABASE='Petsbnb' -p 3307:3306 -d percona/percona-server

En el espacio "RUTA", indicamos la carpeta en la cual se quiere almacenar la base de datos. 

ACLARACIÓN: 
1- En caso de estar utilizando Windows, la ruta debe ser indicado con barras dobles invertidas. Ejemplo: "C:\\Users\\mi-user\\carpeta-elegida\\". 
2- Si se utiliza Linux o Mac, la ruta debe ser escrita con las barras normales. Ejemplo: "C:/Users/mi-user/carpeta-elegida/". 

En caso de que salga un error de que el usuario admin no tiene los privilegios sigan estos pasos.
### 1. Acceder al contenedor
docker exec -it Petsbnb mysql -uroot

### 2. Una vez dentro de MySQL, ejecutar estos comandos SQL:
* GRANT ALL PRIVILEGES ON Petsbnb.* TO 'admin';
* FLUSH PRIVILEGES;
* EXIT;


## Stripe
Para la pasarela de pago con stripe necesitaremos crear una cuenta en Stripe y crear un archivo .env en la carpeta de Backend donde tendremos nuestras dos keys necesarias.
Al crear la cuenta nos aparecerá una secret private key, esta es la key que guardaremos en la variable STRIPE_SECRET_KEY.

STRIPE_SECRET_KEY = *sk_test_51... key proporcionada por stripe*.

Luego la otra variable vamos a necesitar descargar el CLI de Stripe https://docs.stripe.com/stripe-cli?locale=es-419:
Luego de descargar el .exe iniciamos una terminal en esa carpeta y ejecutamos el siguiente comando:

- stripe login

Este comando mostrará un link a una pagina de stripe loguearse. Luego de esto ejecutamos el siguiente comando

- stripe listen --forward-to localhost:3000/api/webhook/stripe

Este nos devolverá otra key que es la que necesitaremos agregar en la otra variable de entorno.

STRIPE_WEBHOOK_SECRET = *key proporcionada por la terminal*


## GUÍA EJECUCIÓN DE TEST FRONTEND:
Esta guía detalla los pasos necesarios para instalar, configurar y ejecutar la suite de pruebas del proyecto (Tests Unitarios con Vitest y Tests E2E con Playwright).

Instalaciones previas (desde la carpeta Frontend):
### Instalar dependencias del proyecto
npm install
### Instalar navegadores de Playwright (necesario solo la primera vez)
npx playwright install

Preparar entorno:
## Backend: Iniciar Base de datos.
## Frontend: Correr npm run dev

Ejecución de tests (desde la carpeta Frontend) :
- Test unitario: npx vitest run
- Test E2E: npx playwright test --headed

Vista de resultados:
- Test unitario: npx vitest --ui
- Test E2E: npx playwright show-report