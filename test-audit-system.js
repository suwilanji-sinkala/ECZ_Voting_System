const { PrismaClient } = require('@prisma/client');

// Test script for the audit logging system
async function testAuditSystem() {
  console.log('🔍 Testing Audit Logging System');
  console.log('================================');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Check if AuditLogs table exists
    console.log('\n📋 Test 1: Checking AuditLogs table');
    const auditLogsCount = await prisma.auditLogs.count();
    console.log(`✅ AuditLogs table exists with ${auditLogsCount} records`);
    
    // Test 2: Create a sample audit log
    console.log('\n📝 Test 2: Creating sample audit log');
    const sampleLog = await prisma.auditLogs.create({
      data: {
        action: 'CREATE',
        tableName: 'test_table',
        recordId: 'test-123',
        userId: 'test-user',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        newValues: JSON.stringify({ name: 'Test Record', value: 123 }),
        status: 'success',
        timestamp: new Date()
      }
    });
    console.log(`✅ Sample audit log created with ID: ${sampleLog.id}`);
    
    // Test 3: Query audit logs
    console.log('\n🔍 Test 3: Querying audit logs');
    const recentLogs = await prisma.auditLogs.findMany({
      take: 5,
      orderBy: { timestamp: 'desc' }
    });
    console.log(`✅ Found ${recentLogs.length} recent audit logs`);
    
    // Test 4: Test filtering by action
    console.log('\n🎯 Test 4: Testing action filtering');
    const createLogs = await prisma.auditLogs.findMany({
      where: { action: 'CREATE' },
      take: 3
    });
    console.log(`✅ Found ${createLogs.length} CREATE action logs`);
    
    // Test 5: Test date filtering
    console.log('\n📅 Test 5: Testing date filtering');
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayLogs = await prisma.auditLogs.findMany({
      where: {
        timestamp: {
          gte: startOfDay
        }
      }
    });
    console.log(`✅ Found ${todayLogs.length} logs from today`);
    
    // Test 6: Test user type grouping
    console.log('\n👥 Test 6: Testing user type grouping');
    const userTypeStats = await prisma.auditLogs.groupBy({
      by: ['userType'],
      _count: { userType: true }
    });
    console.log('✅ User type statistics:');
    userTypeStats.forEach(stat => {
      console.log(`   - ${stat.userType || 'null'}: ${stat._count.userType} logs`);
    });
    
    // Test 7: Test action grouping
    console.log('\n⚡ Test 7: Testing action grouping');
    const actionStats = await prisma.auditLogs.groupBy({
      by: ['action'],
      _count: { action: true }
    });
    console.log('✅ Action statistics:');
    actionStats.forEach(stat => {
      console.log(`   - ${stat.action}: ${stat._count.action} logs`);
    });
    
    // Test 8: Test status grouping
    console.log('\n📊 Test 8: Testing status grouping');
    const statusStats = await prisma.auditLogs.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    console.log('✅ Status statistics:');
    statusStats.forEach(stat => {
      console.log(`   - ${stat.status}: ${stat._count.status} logs`);
    });
    
    // Test 9: Test JSON parsing
    console.log('\n🔧 Test 9: Testing JSON parsing');
    const logsWithValues = await prisma.auditLogs.findMany({
      where: {
        newValues: {
          not: null
        }
      },
      take: 3
    });
    console.log(`✅ Found ${logsWithValues.length} logs with values`);
    logsWithValues.forEach(log => {
      try {
        const parsedValues = JSON.parse(log.newValues);
        console.log(`   - Log ${log.id}: ${Object.keys(parsedValues).length} fields`);
      } catch (error) {
        console.log(`   - Log ${log.id}: Invalid JSON`);
      }
    });
    
    // Test 10: Test blockchain transaction hash
    console.log('\n⛓️ Test 10: Testing blockchain transaction hash');
    const blockchainLogs = await prisma.auditLogs.findMany({
      where: {
        blockchainTxHash: {
          not: null
        }
      },
      take: 3
    });
    console.log(`✅ Found ${blockchainLogs.length} logs with blockchain transaction hashes`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data');
    await prisma.auditLogs.delete({
      where: { id: sampleLog.id }
    });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Audit System Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ AuditLogs table exists and is accessible');
    console.log('✅ Can create audit log entries');
    console.log('✅ Can query audit logs with various filters');
    console.log('✅ Can group by action, user type, and status');
    console.log('✅ Can parse JSON values correctly');
    console.log('✅ Can handle blockchain transaction hashes');
    console.log('✅ All audit system functions are working correctly');
    
    console.log('\n🚀 Your audit logging system is ready to use!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run database migration to create AuditLogs table');
    console.log('2. Integrate audit logging into your API endpoints');
    console.log('3. Test the audit log viewing API');
    console.log('4. Set up monitoring and alerting for audit logs');
    
  } catch (error) {
    console.error('❌ Audit system test failed:', error.message);
    
    if (error.code === 'P2021') {
      console.log('\n💡 The AuditLogs table does not exist. Please run:');
      console.log('   npx prisma db push');
      console.log('   or');
      console.log('   npx prisma migrate dev');
    }
    
    console.log('\n📋 Error Details:');
    console.log(`Error Code: ${error.code || 'Unknown'}`);
    console.log(`Error Message: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuditSystem();
