import { Request, Response } from "express";
import isBase64 from "is-base64";
import moment from "moment";
import geminiService from "../service/GeminiService";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import config from "../config";
import { join } from "path";
import { v4 as uuidv4 } from 'uuid';
import { Measurement } from "../models";
import { Op, Sequelize } from "sequelize";
import { MeasurementType, MeasureType } from "../models/measurement";
import { UUID } from "crypto";
import Utils from "../../utils";

interface SearchListType {
    measureType?: MeasureType;
    customerCode: string;
}

interface MeasurementFormatedType {
    measure_uuid?: UUID;
    measure_datetime?: Date;
    measure_type?: MeasureType;
    has_confirmed?: Boolean;
    image_url?: string;
};

const formatListMeasurement = (obj: MeasurementType, req: Request) => {
    let newObj: MeasurementFormatedType = {}

    newObj.measure_uuid = obj.id;
    newObj.measure_datetime = obj.measureDatetime;
    newObj.measure_type = obj.measureType;
    newObj.has_confirmed = obj.hasConfirmed;
    newObj.image_url = `${req.protocol}://${req.headers.host}/get-file/${obj.customerCode}/${obj.fileName}`;

    return newObj;
}

class MeasurementController {

    public async upload(req:Request, res:Response) {

        let pathFile: string = "";
        
        try {
            const {
                image,
                customer_code,
                measure_datetime,
                measure_type
            } = req.body;

            if(!customer_code) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "customer_code deve ser informado."
            });

            if(typeof customer_code !== "string") return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "customer_code deve ser do tipo string."
            });
    
            if(!measure_type) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "measure_type não foi informado."
            });
            if(!["WATER", "GAS"].includes(measure_type)) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "measure_type deve ser WATER ou GAS."
            });
    
            if(!moment(measure_datetime, "YYYY-MM-DD HH:mm:ss").isValid()) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "Informe measure_datetime no formato YYYY-MM-DD HH:mm:ss"
            });
    
            if(!isBase64(image, { mimeRequired: true, allowMime: true })) return res.status(400).json({
                "error_code": "INVALID_DATA",
                "error_description": "Informe image no formato base64."
            });

            const mimeType = (image.match(/^data:(.+);/))[1];
    
            if(!["image/jpeg", "image/png", "image/jpg"].includes(mimeType)) return res.status(400).json("O base64 da imagem precisa ser image/jpeg, image/png ou image/jpg.");

            const hasMeasurement = await Measurement.findOne({
                where: {
                    customerCode: customer_code,
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('measureDatetime')), moment(measure_datetime, "YYYY-MM-DD HH:mm:ss").format("MM")),
                        Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('measureDatetime')), moment(measure_datetime, "YYYY-MM-DD HH:mm:ss").format("YYYY"))
                    ],
                    measureType: measure_type
                }
            });

            if(hasMeasurement) return res.status(409).json({
                error_code: "DOUBLE_REPORT",
                error_description: "Leitura do mês já realizada"
            });

            const ext = mimeType.replace("image/", "");

            const pathCustomer = join(config.dataPath, customer_code);

            mkdirSync(pathCustomer, { recursive: true });
            const fileName = `${uuidv4()}.${ext}`;
            pathFile = join(pathCustomer, fileName);
            
            writeFileSync(pathFile, image.replace(/^data:image\/.+;base64,/, ""), 'base64');
            
            const measurementNumber = await geminiService.recognizeImage(pathFile, "What the measurement?")
                .then(result=>{
                    const measurement = (result as string).match(/\d+\.?\d+/);
                    return measurement ? Number(measurement[0]) : measurement;
                });
            
            const measurement = await Measurement.create({
                measureValue: measurementNumber,
                customerCode: customer_code,
                measureDatetime: measure_datetime,
                measureType: measure_type,
                fileName
            });
            
            return res.json({
                image_url: `${req.protocol}://${req.headers.host}/get-file/${customer_code}/${fileName}`,
                measure_value: measurementNumber,
                measure_uuid: measurement.id
            });
        } catch (error) {
            if(pathFile){
                if(existsSync(pathFile)){
                    unlinkSync(pathFile);
                }
            }
            Utils.processError(error as string | Error, res);
        }
    }

    public async confirm(req:Request, res:Response) {
        try {
            const {
                measure_uuid,
                confirmed_value
            } = req.body;

            if(!measure_uuid) return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "measure_uuid não foi informado."
            });

            if(typeof measure_uuid !== "string") return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "measure_uuid deve ser do tipo string."
            });

            if(!confirmed_value) return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "confirmed_value não foi informado."
            });

            if(typeof confirmed_value !== "number") return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "measure_uuid deve ser do tipo número."
            });

            const measurement = await Measurement.findByPk(measure_uuid);

            if(!measurement) return res.status(404).json({
                error_code: "MEASURE_NOT_FOUND",
                error_description: "Leitura não encontrada"
            });

            if(measurement.hasConfirmed) return res.status(409).json({
                error_code: "CONFIRMATION_DUPLICATE",
                error_description: "Leitura do mês já realizada"
            });

            measurement.hasConfirmed = true;
            measurement.measureValue = confirmed_value;

            await measurement.save();

            return res.status(200).json({
                success: true
            });

        } catch (error) {
            Utils.processError(error as string | Error, res);
        }
    }

    public async list(req:Request, res:Response) {
        
        try {
            
            const { customer_code } = req.params;
            const { measure_type } = req.query;

            if(measure_type && (typeof measure_type !== "string" || !["WATER", "GAS"].includes(measure_type.toUpperCase()))) return res.status(400).json({
                error_code: "INVALID_TYPE",
                error_description: "Tipo de medição não permitida"
            });

            const search: SearchListType = {
                customerCode: customer_code
            }

            if(measure_type) search.measureType = (measure_type as any).toUpperCase();

            const measurements: MeasurementType[] = await Measurement.findAll({
                where: search
            });

            return res.status(200).json({
                customer_code,
                measures: measurements.map(measurement => formatListMeasurement(measurement, req))
            });

        } catch (error) {
            Utils.processError(error as string | Error, res);
        }
    }

}

export const measurementController = new MeasurementController();