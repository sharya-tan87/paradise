const { DentistProfile, DentistService, Service, User } = require('../models');
const { Op } = require('sequelize');

// Get all dentist profiles
exports.getAllDentistProfiles = async (req, res) => {
    try {
        const profiles = await DentistProfile.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'active']
                },
                {
                    model: Service,
                    as: 'services',
                    through: { attributes: ['customPrice'] }
                }
            ]
        });

        res.json(profiles);
    } catch (error) {
        console.error('Error fetching dentist profiles:', error);
        res.status(500).json({ error: 'Failed to fetch dentist profiles' });
    }
};

// Get dentist profile by user ID
exports.getDentistProfileByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await DentistProfile.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'active']
                },
                {
                    model: Service,
                    as: 'services',
                    through: { attributes: ['customPrice'] }
                }
            ]
        });

        if (!profile) {
            return res.status(404).json({ error: 'Dentist profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching dentist profile:', error);
        res.status(500).json({ error: 'Failed to fetch dentist profile' });
    }
};

// Get dentist profile by ID
exports.getDentistProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await DentistProfile.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'active']
                },
                {
                    model: Service,
                    as: 'services',
                    through: { attributes: ['customPrice'] }
                }
            ]
        });

        if (!profile) {
            return res.status(404).json({ error: 'Dentist profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching dentist profile:', error);
        res.status(500).json({ error: 'Failed to fetch dentist profile' });
    }
};

// Create or update dentist profile
// Create or update dentist profile
exports.upsertDentistProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        let {
            licenseNumber,
            specializations,
            certificates,
            education,
            experience,
            bio,
            bioTh,
            consultationFee,
            availableDays,
            workingHours,
            serviceIds // Array of service IDs to associate
        } = req.body;

        // Verify user exists and is a dentist
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'dentist') {
            return res.status(400).json({ error: 'User is not a dentist' });
        }

        // Helper to safe parse JSON
        const safeParse = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return val; }
            }
            return val;
        };

        specializations = safeParse(specializations);
        certificates = safeParse(certificates);
        education = safeParse(education);
        availableDays = safeParse(availableDays);
        workingHours = safeParse(workingHours);
        serviceIds = safeParse(serviceIds);

        // Find or create profile
        let profile = await DentistProfile.findOne({ where: { userId } });

        const profileData = {
            userId,
            licenseNumber,
            specializations: specializations || [],
            certificates: certificates || [],
            education: education || [],
            experience,
            bio,
            bioTh,
            consultationFee,
            availableDays: availableDays || [1, 2, 3, 4, 5],
            workingHours: workingHours || { start: "09:00", end: "17:00" }
        };

        // Handle image upload
        if (req.file) {
            profileData.imagePath = '/uploads/dentist-profiles/' + req.file.filename;
        }

        if (profile) {
            await profile.update(profileData);
        } else {
            profile = await DentistProfile.create(profileData);
        }

        // Update service associations if provided
        if (serviceIds && Array.isArray(serviceIds)) {
            // Remove existing associations
            await DentistService.destroy({ where: { dentistProfileId: profile.id } });

            // Add new associations
            for (const serviceId of serviceIds) {
                await DentistService.create({
                    dentistProfileId: profile.id,
                    serviceId
                });
            }
        }

        // Fetch updated profile with associations
        const updatedProfile = await DentistProfile.findByPk(profile.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'active']
                },
                {
                    model: Service,
                    as: 'services',
                    through: { attributes: ['customPrice'] }
                }
            ]
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error upserting dentist profile:', error);
        res.status(500).json({ error: 'Failed to save dentist profile' });
    }
};

// Update dentist services
exports.updateDentistServices = async (req, res) => {
    try {
        const { id } = req.params; // Dentist profile ID
        const { serviceIds, customPrices } = req.body; // customPrices is optional: { serviceId: price }

        const profile = await DentistProfile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ error: 'Dentist profile not found' });
        }

        // Remove existing associations
        await DentistService.destroy({ where: { dentistProfileId: id } });

        // Add new associations
        if (serviceIds && Array.isArray(serviceIds)) {
            for (const serviceId of serviceIds) {
                await DentistService.create({
                    dentistProfileId: id,
                    serviceId,
                    customPrice: customPrices?.[serviceId] || null
                });
            }
        }

        // Fetch updated profile
        const updatedProfile = await DentistProfile.findByPk(id, {
            include: [
                {
                    model: Service,
                    as: 'services',
                    through: { attributes: ['customPrice'] }
                }
            ]
        });

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating dentist services:', error);
        res.status(500).json({ error: 'Failed to update dentist services' });
    }
};

// Delete dentist profile
exports.deleteDentistProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await DentistProfile.findByPk(id);
        if (!profile) {
            return res.status(404).json({ error: 'Dentist profile not found' });
        }

        // Delete associated services first
        await DentistService.destroy({ where: { dentistProfileId: id } });

        // Delete profile
        await profile.destroy();

        res.json({ message: 'Dentist profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting dentist profile:', error);
        res.status(500).json({ error: 'Failed to delete dentist profile' });
    }
};

// Get specialization options
exports.getSpecializations = async (req, res) => {
    try {
        const specializations = [
            { value: 'general_dentistry', label: 'General Dentistry', labelTh: 'ทันตกรรมทั่วไป' },
            { value: 'orthodontics', label: 'Orthodontics', labelTh: 'ทันตกรรมจัดฟัน' },
            { value: 'periodontics', label: 'Periodontics', labelTh: 'ปริทันตวิทยา' },
            { value: 'endodontics', label: 'Endodontics', labelTh: 'วิทยาเอ็นโดดอนต์' },
            { value: 'prosthodontics', label: 'Prosthodontics', labelTh: 'ทันตกรรมประดิษฐ์' },
            { value: 'oral_surgery', label: 'Oral Surgery', labelTh: 'ศัลยกรรมช่องปาก' },
            { value: 'pediatric_dentistry', label: 'Pediatric Dentistry', labelTh: 'ทันตกรรมเด็ก' },
            { value: 'cosmetic_dentistry', label: 'Cosmetic Dentistry', labelTh: 'ทันตกรรมเพื่อความงาม' },
            { value: 'implantology', label: 'Implantology', labelTh: 'รากฟันเทียม' },
            { value: 'oral_pathology', label: 'Oral Pathology', labelTh: 'พยาธิวิทยาช่องปาก' }
        ];
        res.json(specializations);
    } catch (error) {
        console.error('Error fetching specializations:', error);
        res.status(500).json({ error: 'Failed to fetch specializations' });
    }
};
