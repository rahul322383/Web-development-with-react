'use strict';

module.exports = (sequelize, DataTypes) => {

  const Course = sequelize.define(
    'Course',
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
      // COMPANY ID
      // =========================
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,

        field: 'company_id',

        references: {
          model: 'Companies',
          key: 'id',
        },

        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      // =========================
      // CREATED BY
      // =========================
      createdBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,

        field: 'created_by',

        references: {
          model: 'users',
          key: 'id',
        },

        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // =========================
      // TITLE
      // =========================
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      // =========================
      // SLUG
      // =========================
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },

      // =========================
      // DESCRIPTION
      // =========================
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // =========================
      // CATEGORY
      // =========================
      category: {
        type: DataTypes.ENUM(
          'technical',
          'soft_skills',
          'compliance',
          'leadership',
          'onboarding',
          'product',
          'other'
        ),

        allowNull: false,
        defaultValue: 'other',
      },

      // =========================
      // LEVEL
      // =========================
      level: {
        type: DataTypes.ENUM(
          'beginner',
          'intermediate',
          'advanced'
        ),

        allowNull: false,
        defaultValue: 'beginner',
      },

      // =========================
      // FORMAT
      // =========================
      format: {
        type: DataTypes.ENUM(
          'video',
          'document',
          'quiz',
          'mixed',
          'external'
        ),

        allowNull: false,
        defaultValue: 'mixed',
      },

      // =========================
      // THUMBNAIL URL
      // =========================
      thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,

        field: 'thumbnail_url',
      },

      // =========================
      // DURATION MINUTES
      // =========================
      durationMinutes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,

        field: 'duration_minutes',
      },

      // =========================
      // PASSING SCORE
      // =========================
      passingScore: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 70,

        field: 'passing_score',
      },

      // =========================
      // IS MANDATORY
      // =========================
      isMandatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'is_mandatory',
      },

      // =========================
      // IS PUBLISHED
      // =========================
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,

        field: 'is_published',
      },

      // =========================
      // EXTERNAL URL
      // =========================
      externalUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,

        field: 'external_url',
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
      // TARGET ROLES
      // =========================
      targetRoles: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],

        field: 'target_roles',
      },

      // =========================
      // PUBLISHED AT
      // =========================
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,

        field: 'published_at',
      },

    },

    {

      tableName: 'Courses',

      timestamps: true,

      paranoid: true,

      underscored: true,

    }
  );

  return Course;
};