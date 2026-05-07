'use strict';

module.exports = (sequelize, DataTypes) => {
    const ShiftAssignment = sequelize.define('ShiftAssignment', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },

        companyId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'company_id',
        },

        employeeId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'employee_id',
        },

        shiftId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'shift_id',
        },

        assignedBy: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            field: 'assigned_by',
        },

        effectiveFrom: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'effective_from',
        },

        effectiveTo: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'effective_to',
        },

        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_active',
        },

        notes: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },

    }, {
        tableName: 'shift_assignments',
        underscored: true,
        paranoid: true,
        timestamps: true,

        indexes: [
            {
                fields: ['company_id'],
                name: 'idx_shift_assign_company',
            },
            {
                fields: ['employee_id'],
                name: 'idx_shift_assign_emp',
            },
            {
                fields: ['shift_id'],
                name: 'idx_shift_assign_shift',
            },
            {
                fields: ['employee_id', 'effective_from'],
                name: 'idx_shift_assign_emp_date',
            },
            {
                fields: ['is_active'],
                name: 'idx_shift_assign_active',
            },
        ],
    });

    ShiftAssignment.associate = (models) => {

        ShiftAssignment.belongsTo(models.Company, {
            foreignKey: 'companyId',
            as: 'company',
        });

        ShiftAssignment.belongsTo(models.User, {
            foreignKey: 'employeeId',
            as: 'employee',
        });

        ShiftAssignment.belongsTo(models.Shift, {
            foreignKey: 'shiftId',
            as: 'shift',
        });

        ShiftAssignment.belongsTo(models.User, {
            foreignKey: 'assignedBy',
            as: 'assignor',
        });
    };

    return ShiftAssignment;
};