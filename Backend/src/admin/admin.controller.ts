import { Admin } from "./admin.entity.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "../config.js";

async function createAdmin( req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const admin = em.create(Admin, req.body);
    await em.persistAndFlush(admin);
    res.status(201).json({ message: "Admin created successfully", data: admin });

  } catch (error: any) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Error creating admin" });
  }


}

async function adminAuthenticate(req: Request, res: Response, next: NextFunction) {
    console.log("🔒 Auth middleware - Cookies:", req.cookies);
    
    const token = req.cookies.access_token; 
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'No autenticado',
        usuario: null   
      });
      return;
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_JWT_KEY!);
      req.usuario = decoded;
      if(req.usuario.tipoUsuario !== 'admin') {
        res.status(403).json({ 
          success: false,
          message: 'Acceso denegado',
          usuario: null});
        return;
      }
      next(); 

    } catch (err) {
      res.status(403).json({ 
        success: false,
        message: 'Token inválido',
        usuario: null 
      });
      return;
    }

}



export { createAdmin, adminAuthenticate }