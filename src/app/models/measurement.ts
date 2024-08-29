'use strict';

import { UUID } from "crypto";

const {
  Model
} = require('sequelize');

export enum MeasureType {
  WATER,
  GAS
}

interface MeasurementAttributes {
  id: UUID;
  customerCode: string;
  measureDatetime: Date;
  measureType: MeasureType;
  hasConfirmed: Boolean;
  measureValue: Number;
  fileName: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MeasurementType extends Model<MeasurementAttributes> implements MeasurementAttributes {
  public id!: UUID;
  public customerCode!: string;
  public measureDatetime!: Date;
  public measureType!: MeasureType;
  public hasConfirmed!: Boolean;
  public measureValue!: Number;
  fileName!: string;
  public readonly updatedAt!: Date;
  public readonly createdAt!: Date;
}

module.exports = (sequelize: any, DataTypes: any) => {
  const Measurement: MeasurementType = sequelize.define("Measurement", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customerCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    measureDatetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    measureType: {
      type: DataTypes.ENUM("WATER", "GAS"),
      allowNull: false
    },
    hasConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    measureValue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING
    }
  },
  {
    engine: 'MYISAM',
  });
  return Measurement;
}
