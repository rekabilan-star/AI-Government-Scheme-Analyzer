import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, GovernmentScheme, ApplicationTracking, SavedScheme, Notification, Feedback } from '../models/types.js';
import { INITIAL_SCHEMES } from '../services/seedData.js';

interface DatabaseSchema {
  users: User[];
  schemes: GovernmentScheme[];
  applications: ApplicationTracking[];
  savedSchemes: SavedScheme[];
  notifications: Notification[];
  feedbacks: Feedback[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'app_database.json');

// In-memory data store with disk synchronization
let memoryDb: DatabaseSchema = {
  users: [],
  schemes: [],
  applications: [],
  savedSchemes: [],
  notifications: [],
  feedbacks: []
};

let isConnectedToMongo = false;

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Save memory state to disk
function saveToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

// Load database from disk or seed initial data
async function initStore() {
  ensureDataDir();

  let loaded = false;
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content) {
        memoryDb = JSON.parse(content);
        loaded = true;
      }
    } catch (e) {
      console.warn('Could not read existing db file, re-initializing fresh database');
    }
  }

  // Ensure default schemes exist
  if (!memoryDb.schemes || memoryDb.schemes.length === 0) {
    memoryDb.schemes = [...INITIAL_SCHEMES];
  } else {
    // Merge any new schemes from INITIAL_SCHEMES that might be missing
    for (const initScheme of INITIAL_SCHEMES) {
      if (!memoryDb.schemes.find(s => s.id === initScheme.id)) {
        memoryDb.schemes.push(initScheme);
      }
    }
  }

  // Ensure default Admin and Citizen accounts exist
  if (!memoryDb.users || memoryDb.users.length === 0) {
    const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
    const citizenPasswordHash = await bcrypt.hash('Citizen@1234', 10);

    const defaultAdmin: User = {
      id: 'user-admin-01',
      name: 'Central Administrator',
      email: 'admin@gov.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      profile: {
        occupation: 'Government Official',
        state: 'Delhi',
        district: 'New Delhi'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const defaultCitizen: User = {
      id: 'user-citizen-01',
      name: 'Ramesh Kumar',
      email: 'citizen@demo.in',
      passwordHash: citizenPasswordHash,
      role: 'citizen',
      profile: {
        age: 34,
        dob: '1992-05-14',
        gender: 'Male',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        occupation: 'Farmer',
        annualFamilyIncome: 140000,
        education: '10th Pass',
        socialCategory: 'OBC',
        disabilityStatus: false,
        maritalStatus: 'Married'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryDb.users = [defaultAdmin, defaultCitizen];

    // Seed sample tracking for default citizen
    memoryDb.applications = [
      {
        id: 'app-001',
        userId: defaultCitizen.id,
        schemeId: 'scheme-pm-kisan',
        schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        schemeCategory: 'Agriculture & Rural',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        status: 'Submitted',
        applicationDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
        trackingNumber: 'PMKISAN-UP-2026-88492',
        notes: 'Submitted online via CSC Kendra Varanasi. Aadhaar e-KYC completed successfully.',
        checklist: [
          { docName: 'Aadhaar Card', completed: true },
          { docName: 'Land Ownership Records (RoR / Khasra-Khatauni)', completed: true },
          { docName: 'Bank Account Passbook', completed: true }
        ],
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'app-002',
        userId: defaultCitizen.id,
        schemeId: 'scheme-pm-jay',
        schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
        schemeCategory: 'Healthcare & Sanitation',
        ministry: 'Ministry of Health and Family Welfare',
        status: 'Preparing Documents',
        notes: 'Need to get latest family ration card updated at Tehsildar office.',
        checklist: [
          { docName: 'Aadhaar Card', completed: true },
          { docName: 'Ration Card (BPL / Antyodaya / Priority Household)', completed: false },
          { docName: 'Income Certificate', completed: true }
        ],
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    memoryDb.savedSchemes = [
      {
        id: 'save-001',
        userId: defaultCitizen.id,
        schemeId: 'scheme-pmay',
        scheme: INITIAL_SCHEMES.find(s => s.id === 'scheme-pmay') || INITIAL_SCHEMES[2],
        notes: 'Exploring pucca house subsidy under PMAY-Gramin for next financial cycle.',
        savedAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];

    memoryDb.notifications = [
      {
        id: 'notif-001',
        userId: defaultCitizen.id,
        title: 'Welcome to Scheme Analyzer',
        message: 'Your citizen profile has been initialized. Complete your details to get accurate 100% personalized eligibility recommendations.',
        type: 'info',
        read: false,
        link: '/profile',
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif-002',
        userId: defaultCitizen.id,
        title: 'PM-KISAN Installment Verification',
        message: 'Your tracking record for PM-KISAN has been marked as Submitted. Ensure bank Aadhaar seeding is active.',
        type: 'success',
        read: false,
        link: '/applications',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    memoryDb.feedbacks = [
      {
        id: 'fb-001',
        userId: defaultCitizen.id,
        userName: 'Ramesh Kumar',
        userEmail: 'citizen@demo.in',
        rating: 5,
        category: 'Eligibility Analyzer',
        comment: 'Extremely helpful system! It clarified that as an OBC farmer with under 2 Lakh income, I qualify for PM-KISAN and PM-JAY without confusion.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      }
    ];
  }

  saveToDisk();
}

// Connect to MongoDB if URI is provided, otherwise report fallback status
export async function connectDatabase() {
  await initStore();

  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('<username>')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      isConnectedToMongo = true;
      console.log('MongoDB Atlas connected successfully.');
    } catch (err: any) {
      console.warn('MongoDB Atlas connection failed. Falling back to persistent in-memory database store:', err.message);
      isConnectedToMongo = false;
    }
  } else {
    console.log('Running with high-fidelity persistent database store (MONGODB_URI not configured or using template placeholder).');
  }
}

// Unified Database Provider
export const db = {
  isMongoConnected: () => isConnectedToMongo,

  // Users
  users: {
    find: async () => [...memoryDb.users],
    findById: async (id: string) => memoryDb.users.find(u => u.id === id) || null,
    findByEmail: async (email: string) => memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const user: User = {
        ...data,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.users.push(user);
      saveToDisk();
      return user;
    },
    update: async (id: string, updates: Partial<User>) => {
      const index = memoryDb.users.findIndex(u => u.id === id);
      if (index === -1) return null;
      memoryDb.users[index] = {
        ...memoryDb.users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToDisk();
      return memoryDb.users[index];
    },
    count: async () => memoryDb.users.length
  },

  // Schemes
  schemes: {
    find: async (filter?: { category?: string; ministry?: string; isActive?: boolean; search?: string }) => {
      let results = [...memoryDb.schemes];
      if (!filter) return results;

      if (filter.isActive !== undefined) {
        results = results.filter(s => s.isActive === filter.isActive);
      }
      if (filter.category) {
        results = results.filter(s => s.category.toLowerCase() === filter.category!.toLowerCase());
      }
      if (filter.ministry) {
        results = results.filter(s => s.ministry.toLowerCase().includes(filter.ministry!.toLowerCase()));
      }
      if (filter.search) {
        const query = filter.search.toLowerCase();
        results = results.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.shortName.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.ministry.toLowerCase().includes(query) ||
          s.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return results;
    },
    findById: async (id: string) => memoryDb.schemes.find(s => s.id === id) || null,
    create: async (data: Omit<GovernmentScheme, 'id' | 'createdAt' | 'updatedAt'>) => {
      const scheme: GovernmentScheme = {
        ...data,
        id: `scheme-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.schemes.push(scheme);
      saveToDisk();
      return scheme;
    },
    update: async (id: string, updates: Partial<GovernmentScheme>) => {
      const index = memoryDb.schemes.findIndex(s => s.id === id);
      if (index === -1) return null;
      memoryDb.schemes[index] = {
        ...memoryDb.schemes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToDisk();
      return memoryDb.schemes[index];
    },
    delete: async (id: string) => {
      // Soft-toggle or remove
      const index = memoryDb.schemes.findIndex(s => s.id === id);
      if (index === -1) return false;
      memoryDb.schemes[index].isActive = false;
      saveToDisk();
      return true;
    },
    count: async () => memoryDb.schemes.length
  },

  // Applications Tracking
  applications: {
    findByUserId: async (userId: string) => memoryDb.applications.filter(a => a.userId === userId),
    findById: async (id: string) => memoryDb.applications.find(a => a.id === id) || null,
    findAll: async () => [...memoryDb.applications],
    create: async (data: Omit<ApplicationTracking, 'id' | 'createdAt' | 'updatedAt'>) => {
      const app: ApplicationTracking = {
        ...data,
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.applications.push(app);
      saveToDisk();
      return app;
    },
    update: async (id: string, updates: Partial<ApplicationTracking>) => {
      const index = memoryDb.applications.findIndex(a => a.id === id);
      if (index === -1) return null;
      memoryDb.applications[index] = {
        ...memoryDb.applications[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveToDisk();
      return memoryDb.applications[index];
    },
    delete: async (id: string, userId: string) => {
      const index = memoryDb.applications.findIndex(a => a.id === id && a.userId === userId);
      if (index === -1) return false;
      memoryDb.applications.splice(index, 1);
      saveToDisk();
      return true;
    },
    count: async () => memoryDb.applications.length
  },

  // Saved Schemes
  savedSchemes: {
    findByUserId: async (userId: string) => memoryDb.savedSchemes.filter(s => s.userId === userId),
    findUserSavedScheme: async (userId: string, schemeId: string) =>
      memoryDb.savedSchemes.find(s => s.userId === userId && s.schemeId === schemeId) || null,
    create: async (userId: string, scheme: GovernmentScheme, notes?: string) => {
      const existing = memoryDb.savedSchemes.find(s => s.userId === userId && s.schemeId === scheme.id);
      if (existing) return existing;

      const saved: SavedScheme = {
        id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        userId,
        schemeId: scheme.id,
        scheme,
        notes,
        savedAt: new Date().toISOString()
      };
      memoryDb.savedSchemes.push(saved);
      saveToDisk();
      return saved;
    },
    delete: async (userId: string, schemeId: string) => {
      const index = memoryDb.savedSchemes.findIndex(s => s.userId === userId && s.schemeId === schemeId);
      if (index === -1) return false;
      memoryDb.savedSchemes.splice(index, 1);
      saveToDisk();
      return true;
    },
    count: async () => memoryDb.savedSchemes.length
  },

  // Notifications
  notifications: {
    findByUserId: async (userId: string) =>
      memoryDb.notifications
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    create: async (data: Omit<Notification, 'id' | 'createdAt'>) => {
      const notif: Notification = {
        ...data,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString()
      };
      memoryDb.notifications.push(notif);
      saveToDisk();
      return notif;
    },
    markAsRead: async (id: string, userId: string) => {
      const notif = memoryDb.notifications.find(n => n.id === id && n.userId === userId);
      if (notif) {
        notif.read = true;
        saveToDisk();
        return true;
      }
      return false;
    },
    markAllAsRead: async (userId: string) => {
      memoryDb.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      saveToDisk();
      return true;
    }
  },

  // Feedback
  feedbacks: {
    findAll: async () =>
      [...memoryDb.feedbacks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    create: async (data: Omit<Feedback, 'id' | 'createdAt'>) => {
      const fb: Feedback = {
        ...data,
        id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString()
      };
      memoryDb.feedbacks.push(fb);
      saveToDisk();
      return fb;
    },
    respond: async (id: string, response: string) => {
      const fb = memoryDb.feedbacks.find(f => f.id === id);
      if (!fb) return null;
      fb.adminResponse = response;
      saveToDisk();
      return fb;
    },
    count: async () => memoryDb.feedbacks.length
  }
};
