'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create services table
        await queryInterface.createTable('services', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            nameTh: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            descriptionTh: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            category: {
                type: Sequelize.ENUM('general', 'cosmetic', 'orthodontics', 'surgical', 'preventive', 'restorative', 'pediatric'),
                allowNull: false,
                defaultValue: 'general'
            },
            basePrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 30
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            sortOrder: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Seed initial services
        const services = [
            { id: Sequelize.literal('UUID()'), name: 'General Checkup', nameTh: 'ตรวจสุขภาพฟันทั่วไป', category: 'general', basePrice: 500, duration: 30, sortOrder: 1 },
            { id: Sequelize.literal('UUID()'), name: 'Teeth Cleaning', nameTh: 'ขูดหินปูน', category: 'preventive', basePrice: 800, duration: 45, sortOrder: 2 },
            { id: Sequelize.literal('UUID()'), name: 'Teeth Whitening', nameTh: 'ฟอกสีฟัน', category: 'cosmetic', basePrice: 3500, duration: 60, sortOrder: 3 },
            { id: Sequelize.literal('UUID()'), name: 'Dental Filling', nameTh: 'อุดฟัน', category: 'restorative', basePrice: 1200, duration: 45, sortOrder: 4 },
            { id: Sequelize.literal('UUID()'), name: 'Root Canal Treatment', nameTh: 'รักษารากฟัน', category: 'surgical', basePrice: 8000, duration: 90, sortOrder: 5 },
            { id: Sequelize.literal('UUID()'), name: 'Tooth Extraction', nameTh: 'ถอนฟัน', category: 'surgical', basePrice: 1500, duration: 30, sortOrder: 6 },
            { id: Sequelize.literal('UUID()'), name: 'Dental Implant', nameTh: 'รากฟันเทียม', category: 'surgical', basePrice: 45000, duration: 120, sortOrder: 7 },
            { id: Sequelize.literal('UUID()'), name: 'Porcelain Veneer', nameTh: 'วีเนียร์เคลือบฟัน', category: 'cosmetic', basePrice: 15000, duration: 60, sortOrder: 8 },
            { id: Sequelize.literal('UUID()'), name: 'Dental Crown', nameTh: 'ครอบฟัน', category: 'restorative', basePrice: 12000, duration: 60, sortOrder: 9 },
            { id: Sequelize.literal('UUID()'), name: 'Dental Bridge', nameTh: 'สะพานฟัน', category: 'restorative', basePrice: 25000, duration: 90, sortOrder: 10 },
            { id: Sequelize.literal('UUID()'), name: 'Braces (Metal)', nameTh: 'จัดฟันโลหะ', category: 'orthodontics', basePrice: 45000, duration: 60, sortOrder: 11 },
            { id: Sequelize.literal('UUID()'), name: 'Clear Aligners', nameTh: 'จัดฟันใส', category: 'orthodontics', basePrice: 80000, duration: 60, sortOrder: 12 },
            { id: Sequelize.literal('UUID()'), name: 'Pediatric Checkup', nameTh: 'ตรวจฟันเด็ก', category: 'pediatric', basePrice: 400, duration: 30, sortOrder: 13 },
            { id: Sequelize.literal('UUID()'), name: 'Fluoride Treatment', nameTh: 'เคลือบฟลูออไรด์', category: 'preventive', basePrice: 600, duration: 20, sortOrder: 14 },
            { id: Sequelize.literal('UUID()'), name: 'Dental Sealant', nameTh: 'เคลือบหลุมร่องฟัน', category: 'preventive', basePrice: 800, duration: 30, sortOrder: 15 },
            { id: Sequelize.literal('UUID()'), name: 'Gum Treatment', nameTh: 'รักษาโรคเหงือก', category: 'surgical', basePrice: 3000, duration: 45, sortOrder: 16 },
            { id: Sequelize.literal('UUID()'), name: 'Wisdom Tooth Removal', nameTh: 'ผ่าฟันคุด', category: 'surgical', basePrice: 5000, duration: 60, sortOrder: 17 },
            { id: Sequelize.literal('UUID()'), name: 'Dentures', nameTh: 'ฟันปลอม', category: 'restorative', basePrice: 20000, duration: 60, sortOrder: 18 }
        ];

        // Insert services using raw query for UUID generation
        for (const service of services) {
            await queryInterface.sequelize.query(`
        INSERT INTO services (id, name, nameTh, category, basePrice, duration, sortOrder, active, created_at, updated_at)
        VALUES (UUID(), '${service.name}', '${service.nameTh}', '${service.category}', ${service.basePrice}, ${service.duration}, ${service.sortOrder}, true, NOW(), NOW())
      `);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('services');
    }
};
