import { Response } from "express";

export default class Utils {
    public static processError(error: Error | String, res: Response){
        if (typeof error === "string") {
            if(error.indexOf("GoogleGenerativeAI Error") >= 0) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "Informe uma imagem com uma resolução melhor."
            });
            return res.status(500).json(error);
        }

        if (error instanceof Error) {
            return res.status(500).json(error.message);
        }

        return res.status(500).json("Problema no servidor! Entre em contato com o suporte!");
    }
}