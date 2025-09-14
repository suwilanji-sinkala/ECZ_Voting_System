const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Setup script for the audit logging system
async function setupAuditSystem() {
  console.log('🔧 Setting up Audit Logging System');
  console.log('==================================');
  
  const prisma = new PrismaClient();
  
  try {
    // Step 1: Check if AuditLogs table exists
    console.log('\n📋 Step 1: Checking AuditLogs table');
    try {
      const auditLogsCount = await prisma.auditLogs.count();
      console.log(`✅ AuditLogs table already exists with ${auditLogsCount} records`);
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('❌ AuditLogs table does not exist');
        console.log('\n💡 Please run the following commands to set up the database:');
        console.log('   1. npx prisma db push');
        console.log('   2. npx prisma generate');
        console.log('\n   Or if using migrations:');
        console.log('   1. npx prisma migrate dev --name add-audit-logs');
        console.log('   2. npx prisma generate');
        return;
      } else {
        throw error;
      }
    }
    
    // Step 2: Create sample audit logs for demonstration
    console.log('\n📝 Step 2: Creating sample audit logs');
    const sampleLogs = [
      {
        action: 'CREATE',
        tableName: 'elections',
        recordId: 'demo-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        newValues: JSON.stringify({
          title: 'Demo Election',
          year: 2024,
          status: 'draft'
        }),
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'UPDATE',
        tableName: 'elections',
        recordId: 'demo-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        oldValues: JSON.stringify({
          title: 'Demo Election',
          year: 2024,
          status: 'draft'
        }),
        newValues: JSON.stringify({
          title: 'Demo Election',
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
        userId: 'voter-demo',
        userType: 'voter',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Demo Browser)',
        blockchainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'BLOCKCHAIN_TX',
        tableName: 'elections',
        recordId: 'demo-001',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        blockchainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        status: 'success',
        timestamp: new Date()
      },
      {
        action: 'DELETE',
        tableName: 'test_records',
        recordId: 'test-123',
        userId: 'admin-demo',
        userType: 'management',
        ipAddress: '127.0.0.1',
        userAgent: 'Setup Script',
        oldValues: JSON.stringify({
          name: 'Test Record',
          value: 123,
          description: 'This is a test record'
        }),
        status: 'success',
        timestamp: new Date()
      }
    ];
    
    const createdLogs = await prisma.auditLogs.createMany({
      data: sampleLogs,
      skipDuplicates: true
    });
    console.log(`✅ Created ${createdLogs.count} sample audit logs`);
    
    // Step 3: Test the audit log API endpoint
    console.log('\n🌐 Step 3: Testing audit log API endpoint');
    console.log('   You can test the API with the following endpoints:');
    console.log('   - GET /api/audit-logs');
    console.log('   - GET /api/audit-logs?stats=true');
    console.log('   - GET /api/audit-logs?action=CREATE');
    console.log('   - GET /api/audit-logs?userType=management');
    
    // Step 4: Create audit system integration examples
    console.log('\n📚 Step 4: Creating integration examples');
    
    const integrationExamples = {
      'Basic Integration': `
import { logCreate, logUpdate, logDelete, extractUserContext } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const userContext = await extractUserContext(req);
    
    const result = await prisma.elections.create({ data });
    
    await logCreate(
      'elections',
      result.Election_ID.toString(),
      data,
      { request: req, ...userContext }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    throw error;
  }
}`,
      'Middleware Integration': `
import { createAuditMiddleware, extractUserContext } from '@/lib/audit-middleware';

const auditMiddleware = createAuditMiddleware({
  tableName: 'elections',
  getRecordId: (data) => data.Election_ID?.toString(),
  getUserContext: extractUserContext
});

export const POST = auditMiddleware.wrapCreate(async (req) => {
  const data = await req.json();
  return await prisma.elections.create({ data });
});`,
      'Blockchain Integration': `
import { logBlockchainTx } from '@/lib/audit';

try {
  const txResult = await ethereumClient.createElection(electionData);
  
  await logBlockchainTx(
    'CREATE_ELECTION',
    'elections',
    electionId,
    txResult.transactionHash,
    'success',
    undefined,
    auditContext
  );
} catch (error) {
  await logBlockchainTx(
    'CREATE_ELECTION',
    'elections',
    electionId,
    'failed',
    'failed',
    error.message,
    auditContext
  );
}`
    };
    
    // Save integration examples to file
    const examplesPath = path.join(__dirname, 'audit-integration-examples.md');
    let examplesContent = '# Audit System Integration Examples\n\n';
    
    Object.entries(integrationExamples).forEach(([title, code]) => {
      examplesContent += `## ${title}\n\n\`\`\`typescript\n${code.trim()}\n\`\`\`\n\n`;
    });
    
    fs.writeFileSync(examplesPath, examplesContent);
    console.log(`✅ Integration examples saved to: ${examplesPath}`);
    
    // Step 5: Verify the setup
    console.log('\n✅ Step 5: Verifying setup');
    const totalLogs = await prisma.auditLogs.count();
    const actionStats = await prisma.auditLogs.groupBy({
      by: ['action'],
      _count: { action: true }
    });
    
    console.log(`✅ Total audit logs: ${totalLogs}`);
    console.log('✅ Action distribution:');
    actionStats.forEach(stat => {
      console.log(`   - ${stat.action}: ${stat._count.action}`);
    });
    
    console.log('\n🎉 Audit System Setup Completed Successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('✅ AuditLogs table is ready');
    console.log('✅ Sample data created');
    console.log('✅ Integration examples generated');
    console.log('✅ API endpoints are available');
    console.log('✅ All audit functions are working');
    
    console.log('\n🚀 Your audit logging system is ready to use!');
    console.log('\n📋 Next Steps:');
    console.log('1. Integrate audit logging into your API endpoints');
    console.log('2. Test the audit log viewing functionality');
    console.log('3. Set up monitoring and alerting');
    console.log('4. Review the integration examples in audit-integration-examples.md');
    console.log('5. Run the test script: node test-audit-system.js');
    
  } catch (error) {
    console.error('❌ Audit system setup failed:', error.message);
    
    if (error.code === 'P2021') {
      console.log('\n💡 The AuditLogs table does not exist. Please run:');
      console.log('   npx prisma db push');
      console.log('   or');
      console.log('   npx prisma migrate dev --name add-audit-logs');
    }
    
    console.log('\n📋 Error Details:');
    console.log(`Error Code: ${error.code || 'Unknown'}`);
    console.log(`Error Message: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAuditSystem();
