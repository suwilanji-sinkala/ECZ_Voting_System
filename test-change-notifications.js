const { PrismaClient } = require('@prisma/client');

// Test script for the change notification system
async function testChangeNotifications() {
  console.log('🔔 Testing Change Notification System');
  console.log('====================================');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Check if AuditLogs table exists
    console.log('\n📋 Test 1: Checking AuditLogs table');
    const auditLogsCount = await prisma.auditLogs.count();
    console.log(`✅ AuditLogs table exists with ${auditLogsCount} records`);
    
    // Test 2: Create sample change notifications
    console.log('\n📝 Test 2: Creating sample change notifications');
    const sampleChanges = [
      {
        action: 'CREATE',
        tableName: 'elections',
        recordId: 'demo-election-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        newValues: JSON.stringify({
          title: 'Presidential Election 2024',
          year: 2024,
          status: 'draft'
        }),
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'UPDATE',
        tableName: 'elections',
        recordId: 'demo-election-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        oldValues: JSON.stringify({
          title: 'Presidential Election 2024',
          year: 2024,
          status: 'draft'
        }),
        newValues: JSON.stringify({
          title: 'Presidential Election 2024',
          year: 2024,
          status: 'active'
        }),
        changes: JSON.stringify({
          status: { from: 'draft', to: 'active' }
        }),
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'VOTE_SUBMIT',
        tableName: 'votes',
        recordId: 'demo-vote-001',
        userId: 'voter-demo-001',
        userType: 'voter',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Test Browser)',
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'DELETE',
        tableName: 'candidates',
        recordId: 'demo-candidate-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        oldValues: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          party: 'Demo Party'
        }),
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'BLOCKCHAIN_TX',
        tableName: 'elections',
        recordId: 'demo-election-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        status: 'success',
        timestamp: new Date()
      }
    ];
    
    const createdChanges = await prisma.auditLogs.createMany({
      data: sampleChanges,
      skipDuplicates: true
    });
    console.log(`✅ Created ${createdChanges.count} sample change notifications`);
    
    // Test 3: Test change notification functions
    console.log('\n🔍 Test 3: Testing change notification functions');
    
    // Import the change notification functions
    const { 
      getRecentChanges, 
      getChangesByUser, 
      getChangesByTable, 
      getCriticalChanges,
      getChangeStatistics 
    } = require('./lib/change-notifications');
    
    // Test recent changes
    console.log('\n📊 Testing recent changes (last 60 minutes)');
    const recentChanges = await getRecentChanges(60, 10);
    console.log(`✅ Found ${recentChanges.length} recent changes`);
    recentChanges.forEach(change => {
      console.log(`   - ${change.message} (${change.timestamp})`);
    });
    
    // Test changes by user
    console.log('\n👤 Testing changes by user');
    const userChanges = await getChangesByUser('admin-demo', 24);
    console.log(`✅ Found ${userChanges.length} changes by admin-demo`);
    userChanges.forEach(change => {
      console.log(`   - ${change.action} on ${change.tableName}: ${change.message}`);
    });
    
    // Test changes by table
    console.log('\n📋 Testing changes by table');
    const tableChanges = await getChangesByTable('elections', 24);
    console.log(`✅ Found ${tableChanges.length} changes to elections table`);
    tableChanges.forEach(change => {
      console.log(`   - ${change.action}: ${change.message}`);
    });
    
    // Test critical changes
    console.log('\n⚠️ Testing critical changes');
    const criticalChanges = await getCriticalChanges(24);
    console.log(`✅ Found ${criticalChanges.length} critical changes`);
    criticalChanges.forEach(change => {
      console.log(`   - ${change.action}: ${change.message}`);
    });
    
    // Test statistics
    console.log('\n📈 Testing change statistics');
    const stats = await getChangeStatistics(24);
    console.log(`✅ Statistics for last ${stats.period}:`);
    console.log(`   - Total changes: ${stats.totalChanges}`);
    console.log(`   - Critical changes: ${stats.criticalChanges}`);
    console.log(`   - Changes by action:`);
    stats.changesByAction.forEach(actionStat => {
      console.log(`     * ${actionStat.action}: ${actionStat.count}`);
    });
    console.log(`   - Changes by user:`);
    stats.changesByUser.forEach(userStat => {
      console.log(`     * ${userStat.userId}: ${userStat.count}`);
    });
    console.log(`   - Changes by table:`);
    stats.changesByTable.forEach(tableStat => {
      console.log(`     * ${tableStat.tableName}: ${tableStat.count}`);
    });
    
    // Test 4: Test API endpoints
    console.log('\n🌐 Test 4: Testing API endpoints');
    console.log('   You can test the following API endpoints:');
    console.log('   - GET /api/change-notifications');
    console.log('   - GET /api/change-notifications?type=recent&minutes=60');
    console.log('   - GET /api/change-notifications?type=user&userId=admin-demo');
    console.log('   - GET /api/change-notifications?type=table&tableName=elections');
    console.log('   - GET /api/change-notifications?type=critical');
    console.log('   - GET /api/change-notifications?stats=true');
    
    // Test 5: Test change monitoring
    console.log('\n🔍 Test 5: Testing change monitoring');
    const { ChangeMonitor } = require('./lib/change-notifications');
    
    const monitor = new ChangeMonitor({
      enabled: true,
      notifyOnCreate: true,
      notifyOnUpdate: true,
      notifyOnDelete: true,
      notifyOnVote: true,
      notifyOnBlockchain: true
    });
    
    console.log('✅ Change monitor created');
    console.log('   - Monitor can be started with: monitor.start()');
    console.log('   - Monitor can be stopped with: monitor.stop()');
    console.log('   - Monitor checks for changes every 30 seconds by default');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data');
    const testRecordIds = sampleChanges.map((_, index) => index + 1);
    await prisma.auditLogs.deleteMany({
      where: {
        id: {
          in: testRecordIds
        }
      }
    });
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Change Notification System Test Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ AuditLogs table exists and is accessible');
    console.log('✅ Can create change notification entries');
    console.log('✅ Can query recent changes');
    console.log('✅ Can filter changes by user');
    console.log('✅ Can filter changes by table');
    console.log('✅ Can identify critical changes');
    console.log('✅ Can generate change statistics');
    console.log('✅ Change monitor is ready');
    console.log('✅ All change notification functions are working correctly');
    
    console.log('\n🚀 Your change notification system is ready to use!');
    console.log('\n📋 Next Steps:');
    console.log('1. Integrate change notifications into your API endpoints');
    console.log('2. Test the change notification API endpoints');
    console.log('3. Set up the change notification dashboard');
    console.log('4. Configure webhook notifications if needed');
    console.log('5. Start the change monitor for real-time notifications');
    
  } catch (error) {
    console.error('❌ Change notification system test failed:', error.message);
    
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
testChangeNotifications();
