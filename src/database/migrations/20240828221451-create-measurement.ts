'use strict';

import { DataTypes, QueryInterface } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('Measurements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      customerCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      measureDatetime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      measureType: {
        type: Sequelize.ENUM("WATER", "GAS"),
        allowNull: false
      },
      hasConfirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      measureValue: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      fileName: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('Measurements');
  }
};