import { App } from "../app";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import config from "../app/config";
import moment from "moment";
import { join } from "path";
import { Measurement } from "../app/models";
import { MeasurementType } from "../app/models/measurement";
import { Op } from "sequelize";
require('dotenv').config();

test('POST /upload', async () => {

    let measurementId = null;
    let messageError = null;
    let folderCustomer = "";

    try {
        
        const image = readFileSync(join(__dirname, "imageTest.txt"));

        const objFirstResponse = {
            customer_code: uuidv4(),
            measure_type: "GAS",
            measure_datetime: moment().format("YYYY-MM-DD 15:00:00"),
            image: image.toString()
        };
        folderCustomer = join(config.dataPath, objFirstResponse.customer_code);
        const response = await request(new App().server).post('/upload')
            .send(objFirstResponse);
            
        measurementId = response.body.measure_uuid;

        if(response.body.error_code === "INVALID_DATA"){
            expect(response.body).toEqual(
                expect.objectContaining({
                    error_description: expect.any(String)
                })
            );
        } else {
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                expect.objectContaining({
                    measure_uuid: expect.any(String),
                    image_url: expect.any(String),
                    measure_value: expect.any(Number)
                })
            );
        }
        
    } catch (error) {
        if(typeof error === "string"){
            return messageError = error;
        }

        messageError = (error as Error).message;
    }

    if(measurementId){
        const measurement = await Measurement.findByPk(measurementId);
        await measurement.destroy();
    }

    if(existsSync(folderCustomer)){
        rmSync(folderCustomer, { recursive: true, force: true });
    }
    
    if(messageError) throw new Error(messageError);

}, 30000);

test('GET /:customer_code/list', async () => {

    let messageError = null;
    let measurements: MeasurementType[] = [];

    try {

        const customerCode = uuidv4()

        measurements = await Measurement.bulkCreate([
            {
                customerCode: uuidv4(),
                measureType: "WATER",
                measureDatetime: moment().format("YYYY-MM-05 00:00:00"),
                hasConfirmed: false,
                measureValue: 2.5
            },
            {
                customerCode,
                measureType: "WATER",
                measureDatetime: moment().format("YYYY-MM-08 00:00:00"),
                fileName: `${uuidv4()}.png`,
                hasConfirmed: true,
                measureValue: 1.3
            },
            {
                customerCode,
                measureType: "GAS",
                measureDatetime: moment().format("YYYY-MM-19 00:00:00"),
                hasConfirmed: true,
                measureValue: 6.0
            },
            {
                customerCode,
                measureType: "WATER",
                measureDatetime: moment().format("YYYY-MM-11 00:00:00"),
                hasConfirmed: false,
                measureValue: 0.9
            }
        ]);

        const response: any = await request(new App().server).get(`/${customerCode}/list`);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                customer_code: expect.any(String),
                measures: expect.any(Array)
            })
        );

        expect(response.body.customer_code).toBe(customerCode);
        expect(response.body.measures.length).toBe(3);

        response.body.measures.forEach((measure: any)=>{
            expect(measure).toEqual(
                expect.objectContaining({
                    measure_uuid: expect.any(String),
                    has_confirmed: expect.any(Boolean)
                })
            );

            if(!["string", null].includes(typeof measure.measure_type)){
                throw new Error(`Tipo inválido do campo measure_type do objecto com id ${measure.id}!`);
            }

            if(!moment(measure.measure_datetime).isValid()){
                throw new Error(`Tipo inválido do campo measure_datetime do objecto com id ${measure.id}!`);
            }

            const has = measurements.find(m => m.id === measure.measure_uuid && m.customerCode === customerCode);
            if(!has){
                throw new Error(`O objeto com id ${measure.id} não deveria ter retornado como resposta!`);
            }
        });
        
    } catch (error) {
        if(typeof error === "string"){
            return messageError = error;
        }

        messageError = (error as Error).message;
    }

    await Measurement.destroy({
        where: {
            id: {
                [Op.in]: measurements.map((m: MeasurementType) => m.id)
            }
        }
    });
    
    if(messageError) throw new Error(messageError);

});

test('PATCH /confirm', async () => {

    let measurementId = null;
    let messageError = null;

    try {

        const measurement: MeasurementType = await Measurement.create({
            customerCode: uuidv4(),
            measureType: "WATER",
            measureDatetime: moment().format("YYYY-MM-05 00:00:00"),
            hasConfirmed: false,
            measureValue: 2.5
        });

        measurementId = measurement.id;

        const response = await request(new App().server).patch('/confirm')
            .send({
                measure_uuid: measurement.id,
                confirmed_value: 5.0
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true
            })
        );

        const measurementDatabase: MeasurementType = await Measurement.findByPk(measurement.id);
        expect(measurementDatabase?.hasConfirmed).toBe(true);
        expect(measurementDatabase?.measureValue).toBe(5.0);

    } catch (error) {
        if(typeof error === "string"){
            return messageError = error;
        }

        messageError = (error as Error).message;
    }

    if(measurementId){
        await Measurement.destroy({
            where: {
                id: measurementId
            }
        });
    }
    if(messageError) throw new Error(messageError);

});

test('POST /get-file/:customer_code/:file_name', async () => {

    let measurementId = null;
    let messageError = null;
    let folderCustomer = "";
    let customerCode = uuidv4();
    const fileName = `${uuidv4()}.png`;

    try {
        
        const image = readFileSync(join(__dirname, "imageTest.txt"));

        folderCustomer = join(config.dataPath, customerCode);

        mkdirSync(folderCustomer, { recursive: true });

        writeFileSync(join(folderCustomer, fileName), image.toString(), "base64");

        const response = await request(new App().server).get(`/get-file/${customerCode}/${fileName}`)
            .send();
            
        measurementId = response.body.measure_uuid;

        expect(response.status).toBe(200);
        
    } catch (error) {
        if(typeof error === "string"){
            return messageError = error;
        }

        messageError = (error as Error).message;
    }

    if(existsSync(folderCustomer)){
        rmSync(folderCustomer, { recursive: true, force: true });
    }
    
    if(messageError) throw new Error(messageError);

});