import { Request, Response } from "express";
import config from "../config";
import { join } from "path";
import { existsSync } from "fs";
import Utils from "../../utils";

class FileController {
    public async getFile(req:Request, res:Response) {
        try {
            
            const { customer_code, file_name } = req.params;

            const pathCustomer = join(config.dataPath, customer_code);
            const pathFile = join(pathCustomer, file_name);

            if(!existsSync(pathFile)) return res.status(404).json("Arquivo não encontrado!");

            return res.sendFile(pathFile);

        } catch (error) {
            Utils.processError(error as string | Error, res);
        }
    }
}

export const fileController = new FileController();