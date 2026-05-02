'use strict';


// ── SiteStat ─────────────────────────────────────────────────
module.exports.SiteStat = (sequelize, DataTypes) => {
    const SiteStat = sequelize.define('SiteStat', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        key: { type: DataTypes.STRING(80), allowNull: false, unique: true },  // e.g. 'companies', 'employees'
        value: { type: DataTypes.STRING(40), allowNull: false },                // e.g. '2.5K+', '50K+'
        label: { type: DataTypes.STRING(120), allowNull: false },               // e.g. 'Companies Using'
        icon: { type: DataTypes.STRING(60), allowNull: true },                 // lucide icon name
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'site_stats', underscored: true, timestamps: true });
    return SiteStat;
};

// ── Testimonial ───────────────────────────────────────────────
module.exports.Testimonial = (sequelize, DataTypes) => {
    const Testimonial = sequelize.define('Testimonial', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        role: { type: DataTypes.STRING(180), allowNull: false },    // 'HR Director, TechCorp'
        content: { type: DataTypes.TEXT, allowNull: false },
        avatar: { type: DataTypes.STRING(400), allowNull: true },
        rating: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 5 },
        page: { type: DataTypes.ENUM('home', 'demo', 'about'), defaultValue: 'home' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'testimonials', underscored: true, timestamps: true });
    return Testimonial;
};

// ── TeamMember ────────────────────────────────────────────────
module.exports.TeamMember = (sequelize, DataTypes) => {
    const TeamMember = sequelize.define('TeamMember', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(120), allowNull: false },
        role: { type: DataTypes.STRING(180), allowNull: false },
        bio: { type: DataTypes.TEXT, allowNull: true },
        image: { type: DataTypes.STRING(400), allowNull: true },
        linkedinUrl: { type: DataTypes.STRING(400), allowNull: true, field: 'linkedin_url' },
        twitterUrl: { type: DataTypes.STRING(400), allowNull: true, field: 'twitter_url' },
        email: { type: DataTypes.STRING(200), allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'team_members', underscored: true, timestamps: true });
    return TeamMember;
};

// ── Milestone ─────────────────────────────────────────────────
module.exports.Milestone = (sequelize, DataTypes) => {
    const Milestone = sequelize.define('Milestone', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        year: { type: DataTypes.CHAR(4), allowNull: false },
        title: { type: DataTypes.STRING(180), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        icon: { type: DataTypes.STRING(60), allowNull: true },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'milestones', underscored: true, timestamps: true });
    return Milestone;
};

// ── Feature ───────────────────────────────────────────────────
module.exports.Feature = (sequelize, DataTypes) => {
    const Feature = sequelize.define('Feature', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        category: { type: DataTypes.STRING(80), allowNull: false },   // 'core','payroll','attendance'…
        icon: { type: DataTypes.STRING(60), allowNull: false },
        title: { type: DataTypes.STRING(180), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        benefits: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },  // ["Custom fields",…]
        color: { type: DataTypes.STRING(80), allowNull: true },    // Tailwind gradient class
        isPopular: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_popular' },
        showOnHome: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'show_on_home' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'features', underscored: true, timestamps: true });
    return Feature;
};

// ── Integration ───────────────────────────────────────────────
module.exports.Integration = (sequelize, DataTypes) => {
    const Integration = sequelize.define('Integration', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        icon: { type: DataTypes.STRING(10), allowNull: true },   // emoji
        color: { type: DataTypes.STRING(80), allowNull: true },   // Tailwind bg class
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'integrations', underscored: true, timestamps: true });
    return Integration;
};

// ── PricingPlan ───────────────────────────────────────────────
module.exports.PricingPlan = (sequelize, DataTypes) => {
    const PricingPlan = sequelize.define('PricingPlan', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(80), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        monthlyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'monthly_price' },
        yearlyPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'yearly_price' },
        icon: { type: DataTypes.STRING(60), allowNull: true },
        color: { type: DataTypes.STRING(80), allowNull: true },
        features: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },      // included items
        notIncluded: { type: DataTypes.JSON, allowNull: false, defaultValue: [], field: 'not_included' },
        isPopular: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_popular' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'pricing_plans', underscored: true, timestamps: true });
    return PricingPlan;
};

// ── ContactSubmission ─────────────────────────────────────────
module.exports.ContactSubmission = (sequelize, DataTypes) => {
    const ContactSubmission = sequelize.define('ContactSubmission', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        firstName: { type: DataTypes.STRING(80), allowNull: false, field: 'first_name' },
        lastName: { type: DataTypes.STRING(80), allowNull: false, field: 'last_name' },
        email: { type: DataTypes.STRING(200), allowNull: false },
        company: { type: DataTypes.STRING(200), allowNull: true },
        phone: { type: DataTypes.STRING(30), allowNull: true },
        inquiryType: { type: DataTypes.STRING(60), allowNull: false, field: 'inquiry_type' },
        message: { type: DataTypes.TEXT, allowNull: false },
        status: { type: DataTypes.ENUM('new', 'read', 'replied', 'closed'), defaultValue: 'new' },
        ipAddress: { type: DataTypes.STRING(60), allowNull: true, field: 'ip_address' },
    }, { tableName: 'contact_submissions', underscored: true, timestamps: true });
    return ContactSubmission;
};

// ── DemoRequest ───────────────────────────────────────────────
module.exports.DemoRequest = (sequelize, DataTypes) => {
    const DemoRequest = sequelize.define('DemoRequest', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        firstName: { type: DataTypes.STRING(80), allowNull: false, field: 'first_name' },
        lastName: { type: DataTypes.STRING(80), allowNull: false, field: 'last_name' },
        email: { type: DataTypes.STRING(200), allowNull: false },
        phone: { type: DataTypes.STRING(30), allowNull: false },
        company: { type: DataTypes.STRING(200), allowNull: false },
        employees: { type: DataTypes.STRING(30), allowNull: false },  // '1-10','11-50'…
        preferredDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'preferred_date' },
        preferredTime: { type: DataTypes.STRING(20), allowNull: false, field: 'preferred_time' },
        notes: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'), defaultValue: 'pending' },
        ipAddress: { type: DataTypes.STRING(60), allowNull: true, field: 'ip_address' },
    }, { tableName: 'demo_requests', underscored: true, timestamps: true });
    return DemoRequest;
};

// ── HelpCategory ──────────────────────────────────────────────
module.exports.HelpCategory = (sequelize, DataTypes) => {
    const HelpCategory = sequelize.define('HelpCategory', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        icon: { type: DataTypes.STRING(60), allowNull: false },
        title: { type: DataTypes.STRING(120), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        color: { type: DataTypes.STRING(80), allowNull: true },
        articleCount: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0, field: 'article_count' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'help_categories', underscored: true, timestamps: true });
    return HelpCategory;
};

// ── HelpArticle ───────────────────────────────────────────────
module.exports.HelpArticle = (sequelize, DataTypes) => {
    const HelpArticle = sequelize.define('HelpArticle', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'category_id' },
        title: { type: DataTypes.STRING(300), allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: true },
        icon: { type: DataTypes.STRING(60), allowNull: true },
        views: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
        helpful: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 95 }, // % helpful
        isPopular: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_popular' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'help_articles', underscored: true, timestamps: true });

    HelpArticle.associate = (models) => {
        HelpArticle.belongsTo(models.HelpCategory, { foreignKey: 'categoryId', as: 'category' });
    };

    return HelpArticle;
};

// ── FAQ ───────────────────────────────────────────────────────
module.exports.FAQ = (sequelize, DataTypes) => {
    const FAQ = sequelize.define('FAQ', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        page: { type: DataTypes.STRING(60), allowNull: false, defaultValue: 'help' }, // help|contact|pricing
        category: { type: DataTypes.STRING(80), allowNull: true },
        question: { type: DataTypes.TEXT, allowNull: false },
        answer: { type: DataTypes.TEXT, allowNull: false },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'faqs', underscored: true, timestamps: true });
    return FAQ;
};

// ── Tutorial ──────────────────────────────────────────────────
module.exports.Tutorial = (sequelize, DataTypes) => {
    const Tutorial = sequelize.define('Tutorial', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING(300), allowNull: false },
        duration: { type: DataTypes.STRING(20), allowNull: false },  // '15:30'
        views: { type: DataTypes.STRING(20), allowNull: false },  // '12K'
        level: { type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'), defaultValue: 'Beginner' },
        videoUrl: { type: DataTypes.STRING(400), allowNull: true, field: 'video_url' },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'tutorials', underscored: true, timestamps: true });
    return Tutorial;
};

// ── SecurityCertification ─────────────────────────────────────
module.exports.SecurityCertification = (sequelize, DataTypes) => {
    const SecurityCertification = sequelize.define('SecurityCertification', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(80), allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        icon: { type: DataTypes.STRING(60), allowNull: true },
        status: { type: DataTypes.STRING(40), defaultValue: 'Certified' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'security_certifications', underscored: true, timestamps: true });
    return SecurityCertification;
};

// ── LegalDocument ─────────────────────────────────────────────
module.exports.LegalDocument = (sequelize, DataTypes) => {
    const LegalDocument = sequelize.define('LegalDocument', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        type: { type: DataTypes.ENUM('privacy', 'terms'), allowNull: false },
        title: { type: DataTypes.STRING(200), allowNull: false },
        sectionKey: { type: DataTypes.STRING(80), allowNull: false, field: 'section_key' }, // 'overview','collection'…
        content: { type: DataTypes.TEXT, allowNull: false },
        icon: { type: DataTypes.STRING(60), allowNull: true },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'legal_documents', underscored: true, timestamps: true });
    return LegalDocument;
};

// ── ContactOffice ─────────────────────────────────────────────
module.exports.ContactOffice = (sequelize, DataTypes) => {
    const ContactOffice = sequelize.define('ContactOffice', {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        city: { type: DataTypes.STRING(80), allowNull: false },
        address: { type: DataTypes.TEXT, allowNull: false },
        phone: { type: DataTypes.STRING(30), allowNull: true },
        email: { type: DataTypes.STRING(200), allowNull: true },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, field: 'sort_order' },
    }, { tableName: 'contact_offices', underscored: true, timestamps: true });
    return ContactOffice;
};

