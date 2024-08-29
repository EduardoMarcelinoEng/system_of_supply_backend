import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import config from '../config/database';
const db: any = {};
const basename = path.basename(__filename);
let sequelize = new Sequelize((config as any).database, (config as any).username, (config as any).password, (config as any));

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (['.js', ".ts"].includes(file.slice(-3)));
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export const Measurement = db.Measurement;

module.exports = db;
