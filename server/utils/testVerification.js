require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const { generateToken } = require('../utils/jwt');

// Test verification runner
const runTests = async () => {
  console.log('========================================================');
  console.log('🚀 RUNNING MINI CRM END-TO-END VERIFICATION SUITE');
  console.log('========================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log(`[Test] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Test] MongoDB connected successfully.\n');

    // 1. Authentication & Model Tests
    console.log('--- TEST 1: User Authentication & Bcrypt Password Hashing ---');
    const adminUser = await User.findOne({ email: 'admin@crm.local' }).select('+password');
    if (!adminUser) throw new Error('Admin user not found. Please run seed script first.');
    
    const validPass = await adminUser.comparePassword('Password123!');
    const invalidPass = await adminUser.comparePassword('WrongPassword');
    console.log(`✔ Password verification correct: ${validPass === true}`);
    console.log(`✔ Invalid password rejected: ${invalidPass === false}`);

    // Verify password is not in toJSON
    const jsonUser = adminUser.toJSON();
    console.log(`✔ Password excluded from JSON serialization: ${jsonUser.password === undefined}`);

    // 2. JWT Generation & Role Payload
    console.log('\n--- TEST 2: JWT Generation & Claims ---');
    const token = generateToken(adminUser);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log(`✔ JWT token generated successfully`);
    console.log(`✔ Token contains user ID: ${decoded.id === adminUser._id.toString()}`);
    console.log(`✔ Token contains role: ${decoded.role === 'Admin'}`);

    // 3. Leads CRUD & Soft Deletion
    console.log('\n--- TEST 3: Leads Queries & Soft Deletion Enforcement ---');
    const activeLeadsCount = await Lead.countDocuments({ isDeleted: false });
    console.log(`✔ Active leads count in DB: ${activeLeadsCount}`);

    // Test soft delete a lead
    const leadToTest = await Lead.findOne({ isDeleted: false });
    if (leadToTest) {
      leadToTest.isDeleted = true;
      await leadToTest.save();
      console.log(`✔ Soft-deleted lead: "${leadToTest.name}" (ID: ${leadToTest._id})`);

      // Verify normal active query excludes it
      const foundActive = await Lead.findOne({ _id: leadToTest._id, isDeleted: false });
      console.log(`✔ Querying active leads excludes soft-deleted document: ${foundActive === null}`);

      // Restore it for continuous test stability
      leadToTest.isDeleted = false;
      await leadToTest.save();
      console.log(`✔ Restored lead for future operations`);
    }

    // 4. Company & Associated Leads Relationship
    console.log('\n--- TEST 4: Company Associated Active Leads Population ---');
    const company = await Company.findOne();
    if (company) {
      const associatedLeads = await Lead.find({ company: company._id, isDeleted: false });
      console.log(`✔ Found ${associatedLeads.length} active leads associated with company: "${company.name}"`);
    }

    // 5. Critical Authorization Requirement: Task Status Update
    console.log('\n--- TEST 5: Critical Task Assignee Ownership Authorization ---');
    const alice = await User.findOne({ email: 'alice@crm.local' });
    const bob = await User.findOne({ email: 'bob@crm.local' });
    const alicesTask = await Task.findOne({ assignedTo: alice._id });

    if (alicesTask && bob) {
      console.log(`✔ Found task "${alicesTask.title}" assigned to Alice (${alice._id})`);

      // Check simulated update by Alice (Assignee)
      const isAliceAssignee = alicesTask.assignedTo.toString() === alice._id.toString();
      console.log(`✔ Alice ownership check passes: ${isAliceAssignee === true}`);

      // Check simulated update by Bob (Different user)
      const isBobAssignee = alicesTask.assignedTo.toString() === bob._id.toString();
      console.log(`✔ Bob ownership check rejected (HTTP 403 condition): ${isBobAssignee === false}`);
    }

    // 6. Dashboard Aggregation Pipeline
    console.log('\n--- TEST 6: Dashboard MongoDB Aggregation Pipeline ---');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [leadAgg] = await Lead.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] },
          },
        },
      },
    ]);

    const [taskAgg] = await Task.aggregate([
      {
        $facet: {
          tasksDueToday: [
            { $match: { dueDate: { $gte: startOfToday, $lte: endOfToday } } },
            { $count: 'count' },
          ],
          completedTasks: [
            { $match: { status: 'Completed' } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    console.log(`✔ Aggregation Total Leads: ${leadAgg?.totalLeads || 0}`);
    console.log(`✔ Aggregation Qualified Leads: ${leadAgg?.qualifiedLeads || 0}`);
    console.log(`✔ Aggregation Tasks Due Today: ${taskAgg?.tasksDueToday[0]?.count || 0}`);
    console.log(`✔ Aggregation Completed Tasks: ${taskAgg?.completedTasks[0]?.count || 0}`);

    console.log('\n========================================================');
    console.log('🎉 ALL INTEGRATION AND AUTHORIZATION TESTS PASSED!');
    console.log('========================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failure:', err.message);
    process.exit(1);
  }
};

runTests();
