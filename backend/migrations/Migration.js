'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('expenses', 'idempotency_key', {
            type: Sequelize.STRING(100),
            allowNull: true,
            unique: true,
            after: 'description'
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('expenses', 'idempotency_key');
    }
};