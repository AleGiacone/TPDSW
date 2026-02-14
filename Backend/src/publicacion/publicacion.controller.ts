import {Request, Response, NextFunction} from 'express';
import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';
import { Cuidador } from '../cuidador/cuidador.entity.js';
import { Imagen }  from '../imagen/imagenes.entity.js';
import sanitizeHTML from 'sanitize-html'
import { authToken } from '../auth.js';
import fs from 'fs';
import { Reserva } from '../reserva/reserva.entity.js';
import { Temporal } from 'temporal-polyfill'
import { DiaReservado } from '../reserva/diaReservado.entity.js';

function sanitizePublicacion(req: Request, res: Response, next: NextFunction) {
  console.log("Sanitizing publicacion input", req.body);
  const precioValue = req.body.tarifaPorDia || req.body.precio;
  const precioNumerico = Number(precioValue);

  req.body.sanitizeInput = {
    idUsuario: sanitizeHTML(req.body.idUsuario),
    titulo: sanitizeHTML(req.body.titulo),
    descripcion: sanitizeHTML(req.body.descripcion),
    tarifaPorDia: !isNaN(precioNumerico) ? precioNumerico : undefined,
    fechaPublicacion: new Date(),
    ubicacion: req.body.ubicacion ? sanitizeHTML(req.body.ubicacion) : undefined,
    tipoAlojamiento: req.body.tipoAlojamiento ? sanitizeHTML(req.body.tipoAlojamiento) : undefined,
    cantAnimales: req.body.cantAnimales ? parseInt(req.body.cantAnimales) : 1,
    exotico: req.body.exotico === true || req.body.exotico === 'true',
    dias: req.body.dias,
    idPublicacion: req.body.idPublicacion
  };

  if (req.body.sanitizeInput.dias != null && req.body.sanitizeInput.dias != undefined) {
      try {
        for (let dias of req.body.sanitizeInput.dias) {
          console.log("Sanitizing date:", dias);
          Temporal.PlainDate.from(dias);
        }
      } catch (error) {
        res.status(400).json({ message: "Error parsing dates", error: error });
        return;
      }
  }
  //Ver object keys borra campos
  // Object.keys(req.body.sanitizeInput).forEach((key) => {
  //   if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
  //     console.log("Removing undefined field:", key);
  //     delete req.body.sanitizeInput[key];
  //   }
  // });
  console.log("Sanitized input:", req.body.sanitizeInput);
  
  next();
}

async function diasReservados(req: Request, res: Response) {
  try {
    console.log("Obteniendo días reservados para la publicación:", req.body.sanitizeInput.idPublicacion);
    const em = orm.em.fork();
    const idPublicacion = Number(req.body.sanitizeInput.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'diasOcupados'] });
      
    const reservasDeLaPublicacion = await em.find(Reserva, { publicacion:  publicacion }, { populate: ['diasReservados'] });
          
    const diasReservados = reservasDeLaPublicacion.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();
    
    const diasOcupados = publicacion.diasOcupados.getItems().map(d => d.fechaReservada);
    const todosLosDiasReservados = Array.from(new Set([...diasReservados, ...diasOcupados]));

    res.status(200).json({ message: "Días reservados obtenidos", data: todosLosDiasReservados });
    }
    catch (error: any) {
    res.status(500).json({ message: "Error retrieving reserved days", error: error.message });
    return;
  }
}



async function reservaCuidador(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Verificando reserva cuidador con data:", req.body.sanitizeInput);
    const em = orm.em.fork();
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion }, { populate: ['reservas'] });
    console.log("Publicacion encontrada:", publicacion);
    const reservasDeLaPublicacion = await em.find(Reserva, { publicacion: publicacion }, { populate: ['diasReservados'] });
    //Todos los dias ya reservados en esa publicacion
    const diasReservados = reservasDeLaPublicacion.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();
    for (let dia of req.body.sanitizeInput.dias) {
      if(diasReservados.includes(Temporal.PlainDate.from(dia).toString())){
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está reservada.` });
        return;
      }
    }
    for (const dia of req.body.sanitizeInput.dias) {
      
      const diaReservado = em.create(DiaReservado, { fechaReservada: dia, publicacion: publicacion });
      publicacion.diasOcupados.add(diaReservado);
    }
    await em.flush();

    res.status(200).json({ message: "Reserva cuidador verificada", data: diasReservados });
  }catch (error: any) {  
    res.status(400).json({ message: "Error verifying reserva cuidador", error: error.message });
    return;
  }

}




// Función para validar los datos de la publicación

async function authenticatePublicacion(req: Request, res: Response): Promise<boolean> {
  const em = orm.em.fork();
  const { titulo, descripcion, tarifaPorDia, ubicacion, tipoAlojamiento, cantAnimales } = req.body.sanitizeInput;

  if (!titulo || titulo.length <= 3) {
    res.status(400).json({ message: "El título debe tener más de 3 caracteres" });
    return false;
  }
  
  if (!descripcion || descripcion.length <= 10) {
    res.status(400).json({ message: "La descripción debe tener más de 10 caracteres" });
    return false;
  }
  
  if (!tarifaPorDia || isNaN(tarifaPorDia) || tarifaPorDia <= 0) {
    res.status(400).json({ message: "El precio debe ser mayor a 0" });
    return false;
  }

  if (ubicacion && ubicacion.length < 3) {
    res.status(400).json({ message: "La ubicación debe tener al menos 3 caracteres" });
    return false;
  }

  if (tipoAlojamiento && !['casa', 'domicilio', 'ambos'].includes(tipoAlojamiento)) {
    res.status(400).json({ message: "Tipo de alojamiento inválido" });
    return false;
  }

  if (cantAnimales && Number(cantAnimales) < 1) {
    res.status(400).json({ message: "La cantidad de animales debe ser al menos 1" });
    return false;
  }
  
  return true;
}

// Función para validar los datos de la publicación

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    // 1. Extraer los parámetros de la URL
    const {
      ubicacion,
      tipoAlojamiento,
      tarifaMax,
      exotico,
      cantAnimales
    } = req.query;

    // 2. Construir el objeto de condiciones (Where Condition)
    const where: any = {};

    // Filtro de Ubicación (búsqueda parcial insensible a mayúsculas/minúsculas)
    if (typeof ubicacion === 'string' && ubicacion) {
      where.ubicacion = { $like: `%${ubicacion}%` };
    }

    // Filtro Tipo de Alojamiento
    if (typeof tipoAlojamiento === 'string' && tipoAlojamiento) {
      where.tipoAlojamiento = tipoAlojamiento;
    }

    // Filtro Tarifa Máxima (tarifaPorDia debe ser menor o igual a tarifaMax)
    if (typeof tarifaMax === 'string' && !isNaN(parseFloat(tarifaMax))) {
      where.tarifaPorDia = { $lte: parseFloat(tarifaMax) };
    }

    // Filtro Cantidad de Animales (cantAnimales debe ser mayor o igual a lo solicitado)
    // Nota: Asumo que el cliente busca publicaciones que acepten al menos la cantidad indicada.
    if (typeof cantAnimales === 'string' && !isNaN(parseInt(cantAnimales))) {
      where.cantAnimales = { $gte: parseInt(cantAnimales) };
    }

    // 🔑 Filtro EXÓTICO (La clave de tu pregunta)
    // Recordatorio: El frontend envía 'true' como string si está marcado.
    if (exotico === 'true') {
      where.exotico = true;
    }
    // Opcional: Si quieres permitir que se envíe 'false' o '0' para *excluir* exóticos
    // else if (exotico === 'false' || exotico === false) {
    //   where.exotico = false;
    // }

    // 3. Ejecutar la consulta con las condiciones
    const publicaciones = await em.find(
      Publicacion,
      where, // Aquí se pasan las condiciones de filtrado
      { populate: ['reservas', 'imagenes', 'idCuidador'] }
    );

    await em.populate(publicaciones, ['idCuidador']);
    res.status(200).json({ message: 'Found all publicaciones', data: publicaciones });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicaciones", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idPublicacion = Number(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes','idCuidador'] });
    res.status(200).json({ message: 'Publicacion found', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicacion", error: error.message });
  }
}

// Funcion para devolver los días reservados en una publicación

async function getDiasReservados(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    console.log("Obteniendo días reservados para la publicación:", req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: parseInt(req.params.idPublicacion) }, { populate: ['reservas'] });
      
    const reservasDeLaPublicacion = await em.find(Reserva, { publicacion:  publicacion }, { populate: ['diasReservados'] });
          
    const diasReservados = reservasDeLaPublicacion.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();
      
    res.status(200).json({ message: "Días reservados obtenidos", data: diasReservados });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reserved days", error: error.message });
    return;
  }


}



// Función para obtener publicaciones por cuidador

async function findByCuidador(req: Request, res: Response): Promise<void> {
  try {
    const em = orm.em.fork();
    const idUsuario = Number(req.params.idUsuario);

    const cuidador = await em.findOne(Cuidador, { idUsuario: idUsuario });
    if (!cuidador) {
      res.status(404).json({ message: "Cuidador no encontrado" });
      return;
    }
    
    const publicaciones = await em.find(
      Publicacion,
      { idCuidador: cuidador },
      { populate: ['imagenes'] }
    );
   
    const publicacionesFormateadas = publicaciones.map((pub) => {
      const imagenesArray = pub.imagenes?.getItems() || [];
      
      const imagenesFormateadas = imagenesArray.map((img: Imagen) => ({
        id: img.idImagen,
        path: img.path,
        url: `http://localhost:3000${img.path}`
      }));
      
      return {
        id: pub.idPublicacion,
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        tarifaPorDia: pub.tarifaPorDia,
        precio: pub.tarifaPorDia,
        fechaPublicacion: pub.fechaPublicacion,
        ubicacion: pub.ubicacion || 'No especificada',
        tipoAlojamiento: pub.tipoAlojamiento || 'No especificado',
        cantAnimales: pub.cantAnimales || 1,
        exotico: pub.exotico || false,
        imagenes: imagenesFormateadas
      };
    });
   
    res.status(200).json({
      message: 'Publicaciones encontradas',
      publicaciones: publicacionesFormateadas,
      data: publicacionesFormateadas
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error retrieving publicaciones del cuidador", 
      error: error.message 
    });
  }
}

async function add(req: Request, res: Response): Promise<void> {
    const files = req.files as Express.Multer.File[] || [];

    try {
      const em = orm.em.fork();
        if (!req.body.sanitizeInput) {
            res.status(400).json({ message: "Datos no procesados correctamente" });
            return;
        }

        const isValid = await authenticatePublicacion(req, res);
        if (!isValid) {
             if (files.length > 0) {
                 files.forEach(file => {
                     fs.unlink(file.path, (unlinkErr) => {
                         if (unlinkErr) console.error("Error al eliminar archivo tras validación:", unlinkErr);
                     });
                 });
             }
             return;
        }

        const { 
            idUsuario, 
            titulo, 
            descripcion, 
            tarifaPorDia,
            ubicacion,
            tipoAlojamiento,
            cantAnimales,
            exotico
        } = req.body.sanitizeInput;

        const numericId = Number(idUsuario);
        const cuidador = await em.findOne(Cuidador, { idUsuario: numericId });
        
        if (!cuidador) {
            res.status(404).json({ message: "Cuidador no encontrado" });
            return;
        }

        const publicacion = new Publicacion();
        publicacion.titulo = titulo;
        publicacion.descripcion = descripcion;
        publicacion.tarifaPorDia = Number(tarifaPorDia);
        publicacion.fechaPublicacion = new Date();
        publicacion.idCuidador = cuidador;
        publicacion.ubicacion = ubicacion;
        publicacion.tipoAlojamiento = tipoAlojamiento;
        publicacion.cantAnimales = Number(cantAnimales);
        publicacion.exotico = Boolean(exotico);

        await em.persistAndFlush(publicacion);

        if (files.length > 0) {
            const imagenesCreadas = files.map(file => {
                const imagen = new Imagen();
                imagen.path = `/img/publicacionImages/${file.filename}`;
                imagen.publicacion = publicacion;
                return imagen;
            });
            
            await em.persistAndFlush(imagenesCreadas);
        }
        
        await em.refresh(publicacion, { populate: ['imagenes'] });
        
        const imagenesFormateadas = publicacion.imagenes.getItems().map((img) => ({
            id: img.idImagen,
            path: img.path,
            url: `http://localhost:3000${img.path}`
        }));
        
        res.status(201).json({
            message: 'Publicacion and Images created',
            data: {
                id: publicacion.idPublicacion,
                titulo: publicacion.titulo,
                descripcion: publicacion.descripcion,
                tarifaPorDia: publicacion.tarifaPorDia,
                ubicacion: publicacion.ubicacion,
                tipoAlojamiento: publicacion.tipoAlojamiento,
                cantAnimales: publicacion.cantAnimales,
                exotico: publicacion.exotico,
                imagenes: imagenesFormateadas
            }
        });

    } catch (error: any) {
        if (files.length > 0) {
            files.forEach(file => {
                fs.unlink(file.path, (unlinkErr) => {
                    if (unlinkErr) console.error("Error al eliminar archivo:", unlinkErr);
                });
            });
        }
        
        res.status(500).json({ 
            message: "Error creating publicacion", 
            error: error.message
        });
    }
}

async function update(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] || [];
  const em = orm.em.fork();
  try {
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(
      Publicacion, 
      { idPublicacion }, 
      { populate: ['imagenes'] }
    );

    em.assign(publicacion, req.body.sanitizeInput);

    if (req.body.imagesToDelete) {
      const imagesToDelete = JSON.parse(req.body.imagesToDelete);
      const imagenesAEliminar = await em.find(Imagen, { 
        idImagen: { $in: imagesToDelete } 
      });

      for (const img of imagenesAEliminar) {
        const filePath = `public${img.path}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        em.remove(img);
      }
    }

    if (files.length > 0) {
      const nuevasImagenes = files.map(file => {
        const imagen = new Imagen();
        imagen.path = `/img/publicacionImages/${file.filename}`;
        imagen.publicacion = publicacion;
        return imagen;
      });

      em.persist(nuevasImagenes);
    }

    await em.flush();
    await em.refresh(publicacion, { populate: ['imagenes'] });
    
    const imagenesFormateadas = publicacion.imagenes.getItems().map(img => ({
      id: img.idImagen,
      path: img.path,
      url: `http://localhost:3000${img.path}`
    }));

    res.status(200).json({ 
      message: 'Publicacion updated', 
      data: {
        ...publicacion,
        imagenes: imagenesFormateadas
      }
    });
  } catch (error: any) {
    if (files.length > 0) {
      files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error al eliminar archivo:", err);
        });
      });
    }
    
    res.status(500).json({ 
      message: "Error updating publicacion", 
      error: error.message 
    });
  }
}

async function remove(req: Request, res: Response) { 
  try {
    const em = orm.em.fork();
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(
      Publicacion, 
      { idPublicacion }, 
      { populate: ['imagenes'] }
    );

    const imagenes = publicacion.imagenes.getItems();
    for (const img of imagenes) {
      const filePath = `public${img.path}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await em.removeAndFlush(publicacion);
    res.status(200).json({ message: 'Publicacion removed', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing publicacion", error: error.message });
  }
}

export { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove, getDiasReservados, reservaCuidador, diasReservados};