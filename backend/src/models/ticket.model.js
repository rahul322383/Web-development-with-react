'use strict';

module.exports = (sequelize, DataTypes) => {

  const Ticket = sequelize.define(
    'Ticket',
    {

      // =========================
      // PRIMARY KEY
      // =========================
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // =========================
      // TICKET NUMBER
      // =========================
      ticketNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,

        field: 'ticket_number',
      },

      // =========================
      // COMPANY ID
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'companies',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // =========================
      // RAISED BY
      // =========================
      raisedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'raised_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // =========================
      // ASSIGNED TO
      // =========================
      assignedTo: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'assigned_to',

        references: {
          model: 'users',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // =========================
      // CATEGORY ID
      // =========================
      categoryId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'category_id',

        references: {
          model: 'ticket_categories',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // =========================
      // BASIC DETAILS
      // =========================
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // =========================
      // PRIORITY
      // =========================
      priority: {
        type: DataTypes.ENUM(
          'low',
          'medium',
          'high',
          'critical'
        ),

        allowNull: false,
        defaultValue: 'medium',
      },

      // =========================
      // STATUS
      // =========================
      status: {
        type: DataTypes.ENUM(
          'open',
          'assigned',
          'in_progress',
          'on_hold',
          'resolved',
          'closed',
          'cancelled'
        ),

        allowNull: false,
        defaultValue: 'open',
      },

      // =========================
      // TYPE
      // =========================
      type: {
        type: DataTypes.ENUM(
          'incident',
          'service_request',
          'change_request',
          'query'
        ),

        allowNull: false,
        defaultValue: 'incident',
      },

      // =========================
      // SLA
      // =========================
      slaResponseHours: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,

        field: 'sla_response_hours',
      },

      slaResolutionHours: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,

        field: 'sla_resolution_hours',
      },

      slaResponseDue: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'sla_response_due',
      },

      slaResolutionDue: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'sla_resolution_due',
      },

      slaResponseBreached: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'sla_response_breached',
      },

      slaResolutionBreached: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'sla_resolution_breached',
      },

      respondedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'responded_at',
      },

      // =========================
      // RESOLUTION
      // =========================
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'resolved_at',
      },

      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'closed_at',
      },

      // =========================
      // SATISFACTION
      // =========================
      satisfactionRating: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,

        field: 'satisfaction_rating',
      },

      satisfactionComment: {
        type: DataTypes.TEXT,
        allowNull: true,

        field: 'satisfaction_comment',
      },

      ratedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'rated_at',
      },

      // =========================
      // ATTACHMENTS
      // =========================
      attachments: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },

      // =========================
      // TAGS
      // =========================
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },

      // =========================
      // INTERNAL FLAG
      // =========================
      isInternal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'is_internal',
      },

      // =========================
      // REOPEN
      // =========================
      reopenCount: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,

        field: 'reopen_count',
      },

      lastReopenedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'last_reopened_at',
      },

    },

    {

      tableName: 'tickets',

      underscored: true,

      timestamps: true,

      paranoid: true,

      indexes: [
        {
          fields: ['ticket_number'],
          unique: true,
        },
        {
          fields: ['company_id'],
        },
        {
          fields: ['raised_by'],
        },
        {
          fields: ['assigned_to'],
        },
        {
          fields: ['category_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['priority'],
        },
      ],

    }
  );

  return Ticket;
};