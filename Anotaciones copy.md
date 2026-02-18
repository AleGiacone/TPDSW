- La aplicacion tiene implementado el Http Only Cookie desde el principio
- Uso Bcrypt para hashearlas contraseñas
- Uso JWT para la autenticacion
- Jest para el testing automatizado
- CORS configurado para aceptar requests desde el frontend



Preguntar por funcion que no se usa en usuario.controller.ts el getme


En el readme actualizarlo para agregarle la configuracion de las rutas de acceso. el cors y en que puerto se crea la bd,
agregar tambien la instalacion de docker para su utilizacion


docker run --name Petsbnb -v C:\Users\Ale\\Documents\\TPDSW\\DB2:/var/lib/mysql -e "MYSQL_ROOT_HOST=%" -e MYSQL_ALLOW_EMPTY_PASSWORD="yes" -e MYSQL_PASSWORD="admin" -e MYSQL_USER="admin" -e MYSQL_DATABASE='Petsbnb' -p 3307:3306 -d percona/percona-server

docker run --name Petsbnb -v C:\Users\Ale\Documents\TPDSW\DB2:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=admin -e MYSQL_DATABASE=Petsbnb -e MYSQL_USER=admin -e MYSQL_PASSWORD=admin -p 3307:3306 -d percona/percona-server


C:\Users\Ale\Documents\TPDSW\DB

-- STRIPE --

cd C:\Users\Ale\Downloads\stripe_1.33.0_windows_i386
stripe --version
stripe login
stripe listen --forward-to localhost:3000/webhook


token admin: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjk5OSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJ0aXBvVXN1YXJpbyI6ImFkbWluIiwiaWF0IjoxNzcxMzQ2NTQ2LCJleHAiOjE3NzEzNTAxNDZ9.930npujZexFdtdTGP3tcDlDkk7BaDSOy-ZoGnl2PwLU

docker run --name Petsbnb -v C:\Users\Ale\\Documents\\TPDSW\\DB2:/var/lib/mysql -e MYSQL_ROOT_HOST=% -e MYSQL_ALLOW_EMPTY_PASSWORD="yes" -e MYSQL_PASSWORD="admin" -e MYSQL_USER="admin" -e MYSQL_DATABASE='Petsbnb' -p 3307:3306 -d percona/percona-server