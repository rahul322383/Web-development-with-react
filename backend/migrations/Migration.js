'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attendances', {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            employee_id: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            check_in: {
                type: Sequelize.TIME,
                allowNull: true,
            },
            check_out: {
                type: Sequelize.TIME,
                allowNull: true,
            },
            worked_minutes: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
            },
            overtime_minutes: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            late_minutes: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('present', 'late', 'absent', 'half_day', 'on_leave', 'holiday'),
                allowNull: false,
                defaultValue: 'absent',
            },
            is_late: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            has_overtime: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            notes: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            check_in_ip: {
                type: Sequelize.STRING(45),
                allowNull: true,
            },
            check_out_ip: {
                type: Sequelize.STRING(45),
                allowNull: true,
            },
            approved_by: {
                type: Sequelize.BIGINT.UNSIGNED,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        // Composite unique — one record per employee per day
        await queryInterface.addIndex('attendances', ['employee_id', 'date'], {
            unique: true,
            name: 'ux_attendance_employee_date',
        });

        await queryInterface.addIndex('attendances', ['date'], { name: 'idx_attendance_date' });
        await queryInterface.addIndex('attendances', ['status'], { name: 'idx_attendance_status' });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('attendances');
    },
};
