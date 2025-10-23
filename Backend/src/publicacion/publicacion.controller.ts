import {Request, Response, NextFunction} from 'express';
import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';
import { Cuidador } from '../cuidador/cuidador.entity.js';
import { Imagen }  from '../imagen/imagenes.entity.js';
import sanitizeHTML from 'sanitize-html'
import { authToken } from '../auth.js';
import fs from 'fs';


function sanitizePublicacion(req: Request, res: Response, next: NextFunction) {
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
    exotico: req.body.exotico === true || req.body.exotico === 'true'
  };

  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  });
  
  next();
}

async function authenticatePublicacion(req: Request, res: Response): Promise<boolean> {
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

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const publicaciones = await em.find(Publicacion, {}, { populate: ['reservas', 'imagenes', 'idCuidador'] });
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
    const em = orm.em.fork();

    try {
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

export { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove };