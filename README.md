# TPDSW
Trabajo Práctico de Desarrollo de Software

Comando para la creación de la base de datos usando Docker:

docker run --name Petsbnb -v C:\\Users\\Ale\\Documents\\TPDSW\\DB:/var/lib/mysql -e MYSQL_ROOT_HOST='%' -e MYSQL_ALLOW_EMPTY_PASSWORD="yes" -e MYSQL_PASSWORD="admin" -e MYSQL_USER="admin" -e MYSQL_DATABASE='Petsbnb' -p 3307:3306 -d percona/percona-server

Ruta: En ruta usar su preferida, en el caso de windows se debera poner una doble barra invertido en vez de una sola. En Linux usar la barra normal.
