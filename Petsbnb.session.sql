SELECT i.id_imagen, i.path, p.titulo 
FROM imagen i 
JOIN publicacion p ON i.publicacion_id_publicacion = p.id_publicacion 
LIMIT 10;