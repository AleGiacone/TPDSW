import {Request, Response, NextFunction} from 'express';
import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';
import { Cuidador } from '../cuidador/cuidador.entity.js';
import path from 'path/win32';
import multer from 'multer';
import { Imagen }  from '../imagen/imagenes.entity.js';
import sanitizeHTML from 'sanitize-html'

function sanitizePublicacion(req: Request, res: Response, next: NextFunction) {
   console.log("=== MIDDLEWARE SANITIZE ===");
  console.log("req.body antes de sanitizar:", JSON.stringify(req.body, null, 2));
  req.body.sanitizeInput = {
    idUsuario: sanitizeHTML(req.body.idUsuario),
    titulo: sanitizeHTML(req.body.titulo),
    descripcion: sanitizeHTML(req.body.descripcion),
    precio: sanitizeHTML(req.body.precio),
    fechaPublicacion: new Date(),
    // Agregar las nuevas propiedades que están en tu entidad
    ubicacion: req.body.ubicacion ? sanitizeHTML(req.body.ubicacion) : undefined,
    tipoAlojamiento: req.body.tipoAlojamiento ? sanitizeHTML(req.body.tipoAlojamiento) : undefined,
    cantAnimales: req.body.cantAnimales ? parseInt(req.body.cantAnimales) : 1,
    exotico: req.body.exotico === true || req.body.exotico === 'true'
  };
  
  // Limpiar valores undefined o vacíos
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(`${key}:`, req.body.sanitizeInput[key]);
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  });
  
  next();
}

const em = orm.em;

async function authenticatePublicacion(req: Request, res: Response): Promise<boolean> {
  // Extraer datos de sanitizeInput en lugar de req.body directamente
  const { titulo, descripcion, precio, ubicacion, tipoAlojamiento, cantAnimales } = req.body.sanitizeInput;

  if (!titulo || titulo.length <= 3) {
    res.status(400).json({ message: "El título debe tener más de 3 caracteres" });
    return false;
  }
  
  if (!descripcion || descripcion.length <= 10) {
    res.status(400).json({ message: "La descripción debe tener más de 10 caracteres" });
    return false;
  }
  
  if (!precio || Number(precio) <= 0) {
    res.status(400).json({ message: "El precio debe ser mayor a 0" });
    return false;
  }

  // Validaciones adicionales para las nuevas propiedades
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
    const publicaciones = await em.find(Publicacion, {}, { populate: ['reservas', 'imagenes'],  });
    await em.populate(publicaciones, ['idCuidador']);
    res.status(200).json({ message: 'Found all publicaciones', data: publicaciones });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicaciones", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  console.log("Adding publicacion with body:", req.body);
  try {
    const idPublicacion = Number(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes'] });
    res.status(200).json({ message: 'Publicacion found', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicacion", error: error.message });
  }
}
async function findByCuidador(req: Request, res: Response): Promise<void> {
  try {
    const idUsuario = Number(req.params.idUsuario);
    console.log('Buscando publicaciones para usuario:', idUsuario);
   
    // Buscar el cuidador usando idUsuario
    const cuidador = await em.findOne(Cuidador, { idUsuario: idUsuario });
    if (!cuidador) {
      res.status(404).json({ message: "Cuidador no encontrado" });
      return;
    }
   
    // Buscar publicaciones del cuidador con todos los datos
    const publicaciones = await em.find(
      Publicacion,
      { idCuidador: cuidador },
      { populate: ['reservas', 'imagenes'] }
    );
    
    console.log(`Encontradas ${publicaciones.length} publicaciones`);
    console.log('Publicaciones raw:', publicaciones);
   
    // Formatear datos usando las propiedades REALES de la entidad
    const publicacionesFormateadas = publicaciones.map(pub => {
      console.log('Formateando publicación:', {
        id: pub.idPublicacion,
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        precio: pub.precio,
        ubicacion: pub.ubicacion,
        tipoAlojamiento: pub.tipoAlojamiento,
        cantAnimales: pub.cantAnimales,
        exotico: pub.exotico,
        fechaPublicacion: pub.fechaPublicacion
      });
      
      return {
        id: pub.idPublicacion,
        titulo: pub.titulo,
        descripcion: pub.descripcion,
        tarifaPorDia: pub.precio,
        precio: pub.precio,
        fechaPublicacion: pub.fechaPublicacion,
        // Usar los valores reales de la base de datos
        ubicacion: pub.ubicacion || 'No especificada',
        tipoAlojamiento: pub.tipoAlojamiento || 'No especificado',
        cantAnimales: pub.cantAnimales || 1,
        exotico: pub.exotico || false
      };
    });
   
    console.log('Publicaciones formateadas:', publicacionesFormateadas);
   
    res.status(200).json({
      message: 'Publicaciones encontradas',
      publicaciones: publicacionesFormateadas,
      data: publicacionesFormateadas
    });
  } catch (error: any) {
    console.error('Error en findByCuidador:', error);
    res.status(500).json({ 
      message: "Error retrieving publicaciones del cuidador", 
      error: error.message 
    });
  }
}
async function add(req: Request, res: Response): Promise<void> {
  console.log("=== INICIANDO CREACION DE PUBLICACION ===");
  console.log("req.body COMPLETO:", JSON.stringify(req.body, null, 2));
  console.log("req.body.sanitizeInput:", JSON.stringify(req.body.sanitizeInput, null, 2));
  
  try {
    // Verificar si sanitizeInput existe
    if (!req.body.sanitizeInput) {
      console.log("ERROR: sanitizeInput no existe");
      res.status(400).json({ message: "Datos no procesados correctamente" });
      return;
    }

    const isValid = await authenticatePublicacion(req, res);
    console.log("Validación completada:", isValid);
    if (!isValid) {
      console.log("Validación falló, terminando");
      return;
    }

    const { 
      idUsuario, 
      titulo, 
      descripcion, 
      precio, 
      fechaPublicacion,
      ubicacion,
      tipoAlojamiento,
      cantAnimales,
      exotico
    } = req.body.sanitizeInput;

    console.log("Datos extraídos:", {
      idUsuario,
      titulo,
      descripcion,
      precio,
      ubicacion,
      tipoAlojamiento,
      cantAnimales,
      exotico
    });

    console.log("idUsuario del sanitizeInput:", idUsuario, "tipo:", typeof idUsuario);
    
    const numericId = Number(idUsuario);
    console.log("ID numérico convertido:", numericId);
    
    if (isNaN(numericId) || numericId <= 0) {
      console.log("ERROR: ID de usuario no es un número válido:", idUsuario, "->", numericId);
      res.status(400).json({ message: `ID de usuario inválido: ${idUsuario}` });
      return;
    }

    const cuidador = await em.findOne(Cuidador, { idUsuario: idUsuario });
    console.log("Cuidador encontrado:", cuidador ? `Sí (ID: ${cuidador.idUsuario})` : "No");
    
    if (!cuidador) {
      res.status(404).json({ message: "Cuidador no encontrado" });
      return;
    }

    console.log("Creando nueva publicación...");
    const publicacion = new Publicacion();
    
    // Asignar propiedades básicas
    publicacion.titulo = titulo;
    publicacion.descripcion = descripcion;
    publicacion.precio = Number(precio);
    publicacion.fechaPublicacion = fechaPublicacion || new Date();
    publicacion.idCuidador = cuidador;
    
    console.log("Propiedades básicas asignadas");
    
    // Asignar propiedades opcionales
    if (ubicacion) {
      publicacion.ubicacion = ubicacion;
      console.log("Ubicación asignada:", ubicacion);
    }
    
    if (tipoAlojamiento) {
      publicacion.tipoAlojamiento = tipoAlojamiento;
      console.log("Tipo alojamiento asignado:", tipoAlojamiento);
    }
    
    if (cantAnimales !== undefined && cantAnimales !== null) {
      publicacion.cantAnimales = Number(cantAnimales);
      console.log("Cantidad animales asignada:", cantAnimales);
    }
    
    if (exotico !== undefined) {
      publicacion.exotico = Boolean(exotico);
      console.log("Exótico asignado:", exotico);
    }

    console.log("Publicación antes de persistir:", {
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      precio: publicacion.precio,
      fechaPublicacion: publicacion.fechaPublicacion,
      ubicacion: publicacion.ubicacion,
      tipoAlojamiento: publicacion.tipoAlojamiento,
      cantAnimales: publicacion.cantAnimales,
      exotico: publicacion.exotico,
      cuidadorId: publicacion.idCuidador.idUsuario
    });

    console.log("Intentando persistir...");
    em.persist(publicacion);
    await em.flush();
console.log("=== VERIFICANDO DATOS GUARDADOS ===");

// Re-consultar la publicación recién creada para verificar qué se guardó
const publicacionGuardada = await em.findOne(
  Publicacion, 
  { idPublicacion: publicacion.idPublicacion }
);

if (publicacionGuardada) {
  console.log("Datos realmente guardados en BD:", {
    idPublicacion: publicacionGuardada.idPublicacion,
    titulo: publicacionGuardada.titulo,
    descripcion: publicacionGuardada.descripcion,
    precio: publicacionGuardada.precio,
    fechaPublicacion: publicacionGuardada.fechaPublicacion,
    ubicacion: publicacionGuardada.ubicacion,
    tipoAlojamiento: publicacionGuardada.tipoAlojamiento,
    cantAnimales: publicacionGuardada.cantAnimales,
    exotico: publicacionGuardada.exotico,
    idCuidador: publicacionGuardada.idCuidador.idUsuario
  });
} else {
  console.log("ERROR: No se pudo re-consultar la publicación guardada");
}


    console.log("Publicación persistida exitosamente con ID:", publicacion.idPublicacion);

    res.status(201).json({
      message: 'Publicacion created',
      data: publicacion,
      id: publicacion.idPublicacion,
      titulo: publicacion.titulo,
      descripcion: publicacion.descripcion,
      tarifaPorDia: publicacion.precio,
      precio: publicacion.precio,
      ubicacion: publicacion.ubicacion,
      tipoAlojamiento: publicacion.tipoAlojamiento,
      cantAnimales: publicacion.cantAnimales,
      exotico: publicacion.exotico
    });

  } catch (error: any) {
    console.error('=== ERROR EN ADD PUBLICACION ===');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack completo:', error.stack);
    
    // Errores específicos de base de datos
    if (error.code) {
      console.error('Código de error DB:', error.code);
    }
    if (error.constraint) {
      console.error('Constraint violada:', error.constraint);
    }
    if (error.detail) {
      console.error('Detalle del error:', error.detail);
    }
    
    res.status(500).json({ 
      message: "Error creating publicacion", 
      error: error.message,
      type: error.constructor.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    return;
  }
}

async function update(req: Request, res: Response) {
  try {
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes'] });
    em.assign(publicacion, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Publicacion updated', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating publicacion", error: error.message });
  }
}

async function remove(req: Request, res: Response) { 
  try {
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes'] });
    await em.removeAndFlush(publicacion);
    res.status(200).json({ message: 'Publicacion removed', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing publicacion", error: error.message });
  }
}



export { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove };