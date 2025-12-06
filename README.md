# TPDSW
Trabajo Práctico de Desarrollo de Software

Para la correcta instalacón tanto del Backend como del Frontend debemos ejecutar en cada una de esas carpetas dos comando. En la carpeta Backend se debe ejecutar "pnpm install" para instalar las dependencias y su comando de ejecución "pnpm start:dev" y en la carpeta Frontend se debe ejecutar "npm install" y luego "npm run dev". Para la base de datos en nuestro utilizamos la herramienta Docker, por lo tanto, debemos crear su contenedor que utilizaremos como base de datos.

Comando para la creación de la base de datos usando Docker:

docker run --name Petsbnb -v **RUTA**:/var/lib/mysql -e MYSQL_ROOT_HOST='%' -e MYSQL_ALLOW_EMPTY_PASSWORD="yes" -e MYSQL_PASSWORD="admin" -e MYSQL_USER="admin" -e MYSQL_DATABASE='Petsbnb' -p 3307:3306 -d percona/percona-server

En el espacio "RUTA", indicamos la carpeta en la cual se quiere guardar la base de datos. 

ACLARACIÓN: 
1- En caso de estar utilizando Windows, la ruta debe ser indicado con barras dobles invertidas. Ejemplo: "C:\\Users\\mi-user\\carpeta-elegida\\". 
2- Si se utiliza Linux o Mac, la ruta debe ser escrita con las barras normales. Ejemplo: "C:/Users/mi-user/carpeta-elegida/". 
