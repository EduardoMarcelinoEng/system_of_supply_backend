import express from "express";
import cors from "cors";
import { router } from "./routers";
import { existsSync, mkdirSync } from "fs";
import config from "./app/config";

export class App{
    public server: express.Application;

    constructor(){
        this.server = express();
        this.createFolders();
        this.middleware();
        this.router();
    }

    private createFolders(){
        if(!existsSync(config.dataPath)){
            mkdirSync(config.dataPath, { recursive: true });
        }
    }

    private middleware(){
        this.server.use(express.json({limit:'20mb'}));
        this.server.use(express.urlencoded({extended:false}));
        this.server.use(cors());
    }

    private router(){
        this.server.use(router);
    }
}