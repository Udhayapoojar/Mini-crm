require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');

// Use reliable public DNS to prevent querySrv ECONNREFUSED
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const User = require('../models/User');
const Company = require('../models/Company');
const Lead = require('../models/Lead');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini_crm';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Lead.deleteMany({}),
      Task.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('[Seed] Creating Users...');
    // We create them via new User() and save so pre-save bcrypt hook hashes passwords
    const usersData = [
      {
        name: 'Alexander Ross (Admin)',
        email: 'admin@crm.local',
        password: 'Password123!',
        role: 'Admin',
      },
      {
        name: 'Alice Walker',
        email: 'alice@crm.local',
        password: 'Password123!',
        role: 'User',
      },
      {
        name: 'Bob Martin',
        email: 'bob@crm.local',
        password: 'Password123!',
        role: 'User',
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@crm.local',
        password: 'Password123!',
        role: 'User',
      },
    ];

    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      users.push(user);
    }
    console.log(`[Seed] Created ${users.length} users.`);

    // 2. Create 5 Companies
    console.log('[Seed] Creating Companies...');
    const companiesData = [
      {
        name: 'Acme Cloud Solutions',
        industry: 'Cloud Software & SaaS',
        location: 'San Francisco, CA',
        description: 'B2B enterprise infrastructure and multi-cloud optimization platform.',
      },
      {
        name: 'Nexus Health Systems',
        industry: 'Healthcare Technology',
        location: 'Boston, MA',
        description: 'Hospital patient engagement solutions and HIPAA-compliant communication tools.',
      },
      {
        name: 'Vantage Global Logistics',
        industry: 'Supply Chain & Freight',
        location: 'Chicago, IL',
        description: 'Automated freight forwarding, route telemetry, and warehousing logistics.',
      },
      {
        name: 'Apex Financial Capital',
        industry: 'FinTech & Banking',
        location: 'New York, NY',
        description: 'High-frequency institutional lending infrastructure and payment processing.',
      },
      {
        name: 'EcoPulse Clean Energy',
        industry: 'Renewable Clean Energy',
        location: 'Austin, TX',
        description: 'Commercial solar and grid energy battery storage hardware provider.',
      },
    ];

    const companies = await Company.insertMany(companiesData);
    console.log(`[Seed] Created ${companies.length} companies.`);

    // 3. Create 15 Leads
    console.log('[Seed] Creating 15 Leads...');
    const leadsData = [
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@acmesoft.com',
        phone: '+1 (555) 234-5678',
        status: 'Qualified',
        assignedTo: users[1]._id, // Alice
        company: companies[0]._id, // Acme
      },
      {
        name: 'Marcus Vance',
        email: 'm.vance@techcorp.io',
        phone: '+1 (555) 345-6789',
        status: 'New',
        assignedTo: users[2]._id, // Bob
        company: companies[0]._id,
      },
      {
        name: 'Dr. Gregory House',
        email: 'ghouse@nexushealth.org',
        phone: '+1 (555) 456-7890',
        status: 'Qualified',
        assignedTo: users[1]._id, // Alice
        company: companies[1]._id, // Nexus Health
      },
      {
        name: 'Lisa Cuddy',
        email: 'lcuddy@nexushealth.org',
        phone: '+1 (555) 567-8901',
        status: 'Contacted',
        assignedTo: users[3]._id, // Charlie
        company: companies[1]._id,
      },
      {
        name: 'David Brent',
        email: 'dbrent@vantagelog.com',
        phone: '+1 (555) 678-9012',
        status: 'Lost',
        assignedTo: users[2]._id, // Bob
        company: companies[2]._id, // Vantage Logistics
      },
      {
        name: 'Dawn Tinsley',
        email: 'dtinsley@vantagelog.com',
        phone: '+1 (555) 789-0123',
        status: 'Qualified',
        assignedTo: users[1]._id, // Alice
        company: companies[2]._id,
      },
      {
        name: 'Logan Roy',
        email: 'lroy@apexfin.com',
        phone: '+1 (555) 890-1234',
        status: 'Contacted',
        assignedTo: users[2]._id, // Bob
        company: companies[3]._id, // Apex Fin
      },
      {
        name: 'Kendall Roy',
        email: 'kroy@apexfin.com',
        phone: '+1 (555) 901-2345',
        status: 'Qualified',
        assignedTo: users[3]._id, // Charlie
        company: companies[3]._id,
      },
      {
        name: 'Shiv Roy',
        email: 'sroy@apexfin.com',
        phone: '+1 (555) 012-3456',
        status: 'New',
        assignedTo: users[1]._id, // Alice
        company: companies[3]._id,
      },
      {
        name: 'Elena Rostova',
        email: 'erostova@ecopulse.energy',
        phone: '+1 (555) 123-4567',
        status: 'Qualified',
        assignedTo: users[2]._id, // Bob
        company: companies[4]._id, // EcoPulse
      },
      {
        name: 'Viktor Stone',
        email: 'vstone@ecopulse.energy',
        phone: '+1 (555) 234-9876',
        status: 'Contacted',
        assignedTo: users[3]._id, // Charlie
        company: companies[4]._id,
      },
      {
        name: 'Rachel Green',
        email: 'rgreen@fashionretail.com',
        phone: '+1 (555) 345-8765',
        status: 'New',
        assignedTo: users[1]._id, // Alice
        company: companies[0]._id,
      },
      {
        name: 'Chandler Bing',
        email: 'cbing@dataanalytics.org',
        phone: '+1 (555) 456-7654',
        status: 'Contacted',
        assignedTo: users[2]._id, // Bob
        company: companies[1]._id,
      },
      {
        name: 'Monica Geller',
        email: 'mgeller@culinarycorp.net',
        phone: '+1 (555) 567-6543',
        status: 'Lost',
        assignedTo: users[3]._id, // Charlie
        company: companies[2]._id,
      },
      {
        name: 'Ross Geller',
        email: 'rgeller@paleotech.edu',
        phone: '+1 (555) 678-5432',
        status: 'Qualified',
        assignedTo: users[1]._id, // Alice
        company: companies[4]._id,
      },
    ];

    const leads = await Lead.insertMany(leadsData);
    console.log(`[Seed] Created ${leads.length} leads.`);

    // 4. Create 10 Tasks (including tasks due today)
    console.log('[Seed] Creating 10 Tasks...');
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const tasksData = [
      {
        title: 'Initial Discovery Call with CTO',
        description: 'Discuss current infrastructure hurdles and integration with AWS.',
        lead: leads[0]._id, // Sarah Connor
        assignedTo: users[1]._id, // Alice
        dueDate: today, // DUE TODAY
        status: 'Pending',
      },
      {
        title: 'Contract Pricing Review',
        description: 'Send enterprise tier discount structure for review.',
        lead: leads[2]._id, // Dr. Gregory House
        assignedTo: users[1]._id, // Alice
        dueDate: today, // DUE TODAY
        status: 'In Progress',
      },
      {
        title: 'Security Compliance Questionnaire',
        description: 'Provide SOC2 Type II audit certificate and data flow diagrams.',
        lead: leads[5]._id, // Dawn Tinsley
        assignedTo: users[2]._id, // Bob
        dueDate: today, // DUE TODAY
        status: 'Completed',
      },
      {
        title: 'Schedule Product Architecture Demo',
        description: 'Walk through real-time telemetry and API capabilities.',
        lead: leads[7]._id, // Kendall Roy
        assignedTo: users[3]._id, // Charlie
        dueDate: tomorrow,
        status: 'Pending',
      },
      {
        title: 'Send NDA and MSA Agreements',
        description: 'Awaiting signature from legal council.',
        lead: leads[9]._id, // Elena Rostova
        assignedTo: users[2]._id, // Bob
        dueDate: inThreeDays,
        status: 'Pending',
      },
      {
        title: 'Technical Requirement Clarification',
        description: 'Clarify SLA uptime guarantees for financial endpoints.',
        lead: leads[6]._id, // Logan Roy
        assignedTo: users[2]._id, // Bob
        dueDate: tomorrow,
        status: 'In Progress',
      },
      {
        title: 'Follow-up on Proposal Submission',
        description: 'Check in on feedback regarding Q3 implementation proposal.',
        lead: leads[1]._id, // Marcus Vance
        assignedTo: users[2]._id, // Bob
        dueDate: yesterday,
        status: 'Completed',
      },
      {
        title: 'Quarterly Check-in Call',
        description: 'Evaluate platform adoption and upcoming expansion plans.',
        lead: leads[3]._id, // Lisa Cuddy
        assignedTo: users[3]._id, // Charlie
        dueDate: tomorrow,
        status: 'Pending',
      },
      {
        title: 'Renew Subscription Agreement',
        description: 'Finalize 12-month annual commitment with procurement.',
        lead: leads[14]._id, // Ross Geller
        assignedTo: users[1]._id, // Alice
        dueDate: inThreeDays,
        status: 'Completed',
      },
      {
        title: 'Lead Re-engagement Email Campaign',
        description: 'Send updated case studies and product roadmap announcement.',
        lead: leads[10]._id, // Viktor Stone
        assignedTo: users[3]._id, // Charlie
        dueDate: tomorrow,
        status: 'Pending',
      },
    ];

    const tasks = await Task.insertMany(tasksData);
    console.log(`[Seed] Created ${tasks.length} tasks.`);

    console.log('\n========================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Admin User:   admin@crm.local     / Password123!');
    console.log('Sales User 1: alice@crm.local     / Password123!');
    console.log('Sales User 2: bob@crm.local       / Password123!');
    console.log('Sales User 3: charlie@crm.local   / Password123!');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
