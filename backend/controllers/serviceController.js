const { Service } = require('../models');
const { Op } = require('sequelize');

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const { category, active, search } = req.query;

        const whereClause = {};

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        if (active !== undefined) {
            whereClause.active = active === 'true';
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { nameTh: { [Op.like]: `%${search}%` } }
            ];
        }

        const services = await Service.findAll({
            where: whereClause,
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });

        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id);

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
};

// Create new service
exports.createService = async (req, res) => {
    try {
        const { name, nameTh, description, descriptionTh, category, basePrice, duration, active, sortOrder } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Service name is required' });
        }

        // Check for duplicate name
        const existing = await Service.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: 'Service with this name already exists' });
        }

        const service = await Service.create({
            name,
            nameTh,
            description,
            descriptionTh,
            category: category || 'general',
            basePrice: basePrice || null,
            duration: duration || 30,
            active: active !== false,
            sortOrder: sortOrder || 0
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nameTh, description, descriptionTh, category, basePrice, duration, active, sortOrder } = req.body;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // Check for duplicate name if name is changing
        if (name && name !== service.name) {
            const existing = await Service.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ error: 'Service with this name already exists' });
            }
        }

        await service.update({
            name: name !== undefined ? name : service.name,
            nameTh: nameTh !== undefined ? nameTh : service.nameTh,
            description: description !== undefined ? description : service.description,
            descriptionTh: descriptionTh !== undefined ? descriptionTh : service.descriptionTh,
            category: category !== undefined ? category : service.category,
            basePrice: basePrice !== undefined ? basePrice : service.basePrice,
            duration: duration !== undefined ? duration : service.duration,
            active: active !== undefined ? active : service.active,
            sortOrder: sortOrder !== undefined ? sortOrder : service.sortOrder
        });

        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        await service.destroy();
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
};

// Toggle service active status
exports.toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        await service.update({ active: !service.active });
        res.json(service);
    } catch (error) {
        console.error('Error toggling service status:', error);
        res.status(500).json({ error: 'Failed to toggle service status' });
    }
};

// Get service categories
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            { value: 'general', label: 'General Dentistry', labelTh: 'ทันตกรรมทั่วไป' },
            { value: 'cosmetic', label: 'Cosmetic Dentistry', labelTh: 'ทันตกรรมเพื่อความงาม' },
            { value: 'orthodontics', label: 'Orthodontics', labelTh: 'ทันตกรรมจัดฟัน' },
            { value: 'surgical', label: 'Oral Surgery', labelTh: 'ศัลยกรรมช่องปาก' },
            { value: 'preventive', label: 'Preventive Care', labelTh: 'ทันตกรรมป้องกัน' },
            { value: 'restorative', label: 'Restorative Dentistry', labelTh: 'ทันตกรรมบูรณะ' },
            { value: 'pediatric', label: 'Pediatric Dentistry', labelTh: 'ทันตกรรมเด็ก' }
        ];
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
