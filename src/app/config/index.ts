import dotenv from 'dotenv'; 
const env = process.env.ENV || "development";
dotenv.config(); 

export default {
    port: process.env.PORT,
    database: {
        development: {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        },
        production: {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        },
        test: {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        }
    }[env]
}