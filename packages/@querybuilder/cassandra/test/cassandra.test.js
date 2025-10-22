import Cassandra from '../Cassandra.js';
import { log } from '@querybuilder/core/utils/utils.js';

/**
 * Comprehensive test suite for Cassandra QueryBuilder integration
 * Tests connection, keyspaces, tables, CQL operations, clustering, consistency
 */

// Test configuration
const TEST_CONFIG = {
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'test_querybuilder'
};

// Test data
const TEST_DATA = {
  users: [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Alice', email: 'alice@example.com', age: 25 },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Bob', email: 'bob@example.com', age: 30 },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Charlie', email: 'charlie@example.com', age: 35 }
  ],
  sessions: [
    { user_id: '550e8400-e29b-41d4-a716-446655440001', session_start: new Date(), activity: 'login' },
    { user_id: '550e8400-e29b-41d4-a716-446655440002', session_start: new Date(), activity: 'purchase' }
  ]
};

class CassandraTest {
  constructor() {
    this.cassandra = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Cassandra QueryBuilder Tests...\n');

    try {
      await this.testConnection();
      await this.testKeyspaceOperations();
      await this.testTableOperations();
      await this.testDataOperations();
      await this.testCollectionOperations();
      await this.testBatchOperations();
      await this.testConsistencyLevels();
      await this.testTimeSeriesOperations();
      await this.testBigDataPatterns();
      await this.testIndexOperations();
      await this.testUDTOperations();
      await this.testMetadataOperations();

    } catch (error) {
      this.logError('Critical test failure', error);
    } finally {
      await this.cleanup();
      this.printResults();
    }
  }

  /**
   * Test Cassandra connection
   */
  async testConnection() {
    console.log('📡 Testing Cassandra Connection...');

    try {
      this.cassandra = new Cassandra(TEST_CONFIG);
      await this.cassandra.connect();
      this.logSuccess('Connection established');

      // Test cluster metadata
      const metadata = this.cassandra.getMetadata();
      this.assertTrue(metadata !== null, 'Cluster metadata retrieved');

    } catch (error) {
      this.logError('Connection failed', error);
      throw error; // Stop tests if connection fails
    }
  }

  /**
   * Test keyspace operations
   */
  async testKeyspaceOperations() {
    console.log('🏛️ Testing Keyspace Operations...');

    try {
      // Drop keyspace if exists (cleanup from previous runs)
      await this.cassandra.dropKeyspace(TEST_CONFIG.keyspace).catch(() => { });

      // Create keyspace
      await this.cassandra.createKeyspace(TEST_CONFIG.keyspace, {
        replication: {
          class: 'SimpleStrategy',
          replication_factor: 1
        },
        durableWrites: true
      });
      this.logSuccess('Keyspace created');

      // Use keyspace
      await this.cassandra.useKeyspace(TEST_CONFIG.keyspace);
      this.logSuccess('Keyspace selected');

      // Verify keyspace metadata
      const ksMetadata = this.cassandra.getKeyspaceMetadata(TEST_CONFIG.keyspace);
      this.assertTrue(ksMetadata !== null, 'Keyspace metadata retrieved');

    } catch (error) {
      this.logError('Keyspace operations failed', error);
    }
  }

  /**
   * Test table operations
   */
  async testTableOperations() {
    console.log('📋 Testing Table Operations...');

    try {
      // Create users table
      await this.cassandra.createTable('users', {
        id: 'uuid',
        name: 'text',
        email: 'text',
        age: 'int',
        created_at: 'timestamp',
        metadata: 'map<text, text>'
      }, {
        primaryKey: 'id',
        ifNotExists: true
      });
      this.logSuccess('Users table created');

      // Create time-series table with clustering
      await this.cassandra.createTable('user_sessions', {
        user_id: 'uuid',
        session_start: 'timestamp',
        activity: 'text',
        duration: 'int',
        metadata: 'map<text, text>'
      }, {
        primaryKey: ['user_id', 'session_start'],
        clusteringOrder: 'session_start DESC',
        compaction: {
          class: 'TimeWindowCompactionStrategy',
          compaction_window_unit: 'DAYS',
          compaction_window_size: '1'
        }
      });
      this.logSuccess('Time-series table created');

      // Test table metadata
      const tableMetadata = this.cassandra.getTableMetadata('users');
      this.assertTrue(tableMetadata !== null, 'Table metadata retrieved');

    } catch (error) {
      this.logError('Table operations failed', error);
    }
  }

  /**
   * Test data operations (CRUD)
   */
  async testDataOperations() {
    console.log('💾 Testing Data Operations (CRUD)...');

    try {
      // Insert users
      for (const user of TEST_DATA.users) {
        await this.cassandra.insert('users', {
          ...user,
          created_at: new Date(),
          metadata: { source: 'test', version: '1.0' }
        });
      }
      this.logSuccess('Users inserted');

      // Select all users
      const allUsers = await this.cassandra.select('users');
      this.assertTrue(allUsers.rows.length === TEST_DATA.users.length, 'All users retrieved');

      // Select specific user
      const specificUser = await this.cassandra.select('users', {
        where: { id: TEST_DATA.users[0].id }
      });
      this.assertTrue(specificUser.rows.length === 1, 'Specific user retrieved');

      // Update user
      await this.cassandra.update('users',
        { age: 26 },
        { id: TEST_DATA.users[0].id }
      );
      this.logSuccess('User updated');

      // Verify update
      const updatedUser = await this.cassandra.select('users', {
        where: { id: TEST_DATA.users[0].id }
      });
      this.assertTrue(updatedUser.rows[0].age === 26, 'User update verified');

      // Delete user
      await this.cassandra.delete('users', { id: TEST_DATA.users[2].id });
      this.logSuccess('User deleted');

      // Verify delete
      const remainingUsers = await this.cassandra.select('users');
      this.assertTrue(remainingUsers.rows.length === TEST_DATA.users.length - 1, 'User deletion verified');

    } catch (error) {
      this.logError('Data operations failed', error);
    }
  }

  /**
   * Test collection operations
   */
  async testCollectionOperations() {
    console.log('📦 Testing Collection Operations...');

    try {
      // Create table with collections
      await this.cassandra.createTable('user_profiles', {
        user_id: 'uuid',
        tags: 'set<text>',
        scores: 'list<int>',
        settings: 'map<text, text>',
        contact_info: 'map<text, text>'
      }, {
        primaryKey: 'user_id'
      });
      this.logSuccess('Collection table created');

      // Insert with collections
      const userId = TEST_DATA.users[0].id;
      await this.cassandra.insert('user_profiles', {
        user_id: userId,
        tags: ['premium', 'verified'],
        scores: [100, 95, 87],
        settings: { theme: 'dark', notifications: 'enabled' },
        contact_info: { phone: '123-456-7890', address: '123 Main St' }
      });
      this.logSuccess('Collection data inserted');

      // Update collections
      await this.cassandra.update('user_profiles',
        { 'tags': "tags + {'vip'}" }, // Add to set
        { user_id: userId }
      );

      await this.cassandra.update('user_profiles',
        { 'scores': "scores + [92]" }, // Append to list
        { user_id: userId }
      );

      await this.cassandra.update('user_profiles',
        { "settings['language']": "'en'" }, // Add to map
        { user_id: userId }
      );
      this.logSuccess('Collections updated');

      // Verify collection updates
      const profile = await this.cassandra.select('user_profiles', {
        where: { user_id: userId }
      });
      const row = profile.rows[0];
      this.assertTrue(row.tags.includes('vip'), 'Set update verified');
      this.assertTrue(row.scores.includes(92), 'List update verified');
      this.assertTrue(row.settings.language === 'en', 'Map update verified');

    } catch (error) {
      this.logError('Collection operations failed', error);
    }
  }

  /**
   * Test batch operations
   */
  async testBatchOperations() {
    console.log('📋 Testing Batch Operations...');

    try {
      const batchQueries = [
        {
          query: 'INSERT INTO users (id, name, email, age, created_at) VALUES (?, ?, ?, ?, ?)',
          params: [this.cassandra.uuid(), 'Batch User 1', 'batch1@example.com', 28, new Date()]
        },
        {
          query: 'INSERT INTO users (id, name, email, age, created_at) VALUES (?, ?, ?, ?, ?)',
          params: [this.cassandra.uuid(), 'Batch User 2', 'batch2@example.com', 32, new Date()]
        }
      ];

      await this.cassandra.executeBatch(batchQueries, { logged: true });
      this.logSuccess('Batch operations executed');

      // Verify batch inserts
      const allUsers = await this.cassandra.select('users');
      this.assertTrue(allUsers.rows.length >= 4, 'Batch inserts verified');

    } catch (error) {
      this.logError('Batch operations failed', error);
    }
  }

  /**
   * Test consistency levels
   */
  async testConsistencyLevels() {
    console.log('⚖️ Testing Consistency Levels...');

    try {
      // Test different consistency levels
      const consistencyLevels = ['one', 'quorum', 'all'];

      for (const level of consistencyLevels) {
        this.cassandra.setConsistencyLevel(level);

        const result = await this.cassandra.select('users', {
          limit: 1
        });

        this.assertTrue(result.rows.length >= 0, `Consistency level ${level} tested`);
      }
      this.logSuccess('Consistency levels tested');

    } catch (error) {
      this.logError('Consistency level tests failed', error);
    }
  }

  /**
   * Test time-series operations
   */
  async testTimeSeriesOperations() {
    console.log('⏰ Testing Time-Series Operations...');

    try {
      // Insert time-series data
      const baseTime = new Date();
      for (let i = 0; i < 5; i++) {
        const sessionTime = new Date(baseTime.getTime() + (i * 60000)); // 1 minute intervals
        await this.cassandra.insert('user_sessions', {
          user_id: TEST_DATA.users[0].id,
          session_start: sessionTime,
          activity: `activity_${i}`,
          duration: 300 + (i * 60),
          metadata: { source: 'test' }
        });
      }
      this.logSuccess('Time-series data inserted');

      // Query with time range
      const sessions = await this.cassandra.select('user_sessions', {
        where: { user_id: TEST_DATA.users[0].id },
        orderBy: 'session_start DESC',
        limit: 3
      });

      this.assertTrue(sessions.rows.length === 3, 'Time-series query with limit');
      this.assertTrue(sessions.rows[0].session_start >= sessions.rows[1].session_start, 'Time-series ordering verified');

    } catch (error) {
      this.logError('Time-series operations failed', error);
    }
  }

  /**
   * Test Big Data patterns
   */
  async testBigDataPatterns() {
    console.log('🌐 Testing Big Data Patterns...');

    try {
      // Create denormalized tables (common Big Data pattern)
      await this.cassandra.createTable('users_by_email', {
        email: 'text',
        user_id: 'uuid',
        name: 'text',
        age: 'int'
      }, {
        primaryKey: 'email'
      });
      this.logSuccess('Denormalized table created');

      // Insert denormalized data
      for (const user of TEST_DATA.users.slice(0, 2)) { // Use first 2 users
        await this.cassandra.insert('users_by_email', {
          email: user.email,
          user_id: user.id,
          name: user.name,
          age: user.age
        });
      }
      this.logSuccess('Denormalized data inserted');

      // Query by email (fast lookup)
      const userByEmail = await this.cassandra.select('users_by_email', {
        where: { email: TEST_DATA.users[0].email }
      });
      this.assertTrue(userByEmail.rows.length === 1, 'Email lookup successful');

      // Create partitioned table (another Big Data pattern)
      await this.cassandra.createTable('events_by_day', {
        day: 'text',
        hour: 'int',
        event_id: 'timeuuid',
        event_type: 'text',
        data: 'text'
      }, {
        primaryKey: ['day', 'hour', 'event_id'],
        clusteringOrder: 'hour DESC, event_id DESC'
      });
      this.logSuccess('Partitioned table created');

    } catch (error) {
      this.logError('Big Data patterns failed', error);
    }
  }

  /**
   * Test index operations
   */
  async testIndexOperations() {
    console.log('🔍 Testing Index Operations...');

    try {
      // Create secondary index
      await this.cassandra.createIndex('users_age_idx', 'users', 'age');
      this.logSuccess('Secondary index created');

      // Query using secondary index
      const usersByAge = await this.cassandra.select('users', {
        where: { age: 26 },
        allowFiltering: true
      });
      this.assertTrue(usersByAge.rows.length >= 0, 'Secondary index query successful');

    } catch (error) {
      this.logError('Index operations failed', error);
    }
  }

  /**
   * Test User Defined Types (UDT)
   */
  async testUDTOperations() {
    console.log('🏗️ Testing UDT Operations...');

    try {
      // Create UDT
      await this.cassandra.createType('address', {
        street: 'text',
        city: 'text',
        zip: 'text',
        country: 'text'
      });
      this.logSuccess('UDT created');

      // Create table using UDT
      await this.cassandra.createTable('user_addresses', {
        user_id: 'uuid',
        home_address: 'address',
        work_address: 'address'
      }, {
        primaryKey: 'user_id'
      });
      this.logSuccess('Table with UDT created');

    } catch (error) {
      this.logError('UDT operations failed', error);
    }
  }

  /**
   * Test metadata operations
   */
  async testMetadataOperations() {
    console.log('📊 Testing Metadata Operations...');

    try {
      // Get cluster metadata
      const metadata = this.cassandra.getMetadata();
      this.assertTrue(metadata.hosts.length > 0, 'Cluster hosts retrieved');

      // Get keyspace metadata
      const ksMetadata = this.cassandra.getKeyspaceMetadata(TEST_CONFIG.keyspace);
      this.assertTrue(Object.keys(ksMetadata.tables).length > 0, 'Keyspace tables retrieved');

      // Get table metadata
      const tableMetadata = this.cassandra.getTableMetadata('users');
      this.assertTrue(Object.keys(tableMetadata.columns).length > 0, 'Table columns retrieved');

      this.logSuccess('Metadata operations completed');

    } catch (error) {
      this.logError('Metadata operations failed', error);
    }
  }

  /**
   * Cleanup test data
   */
  async cleanup() {
    console.log('🧹 Cleaning up test data...');

    try {
      if (this.cassandra && this.cassandra.client) {
        // Drop test keyspace (removes all tables and data)
        await this.cassandra.dropKeyspace(TEST_CONFIG.keyspace);
        await this.cassandra.disconnect();
        this.logSuccess('Cleanup completed');
      }
    } catch (error) {
      this.logError('Cleanup failed', error);
    }
  }

  /**
   * Helper methods for testing
   */
  assertTrue(condition, message) {
    if (condition) {
      this.testResults.passed++;
      console.log(`✅ ${message}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${message}`);
      this.testResults.errors.push(message);
    }
  }

  logSuccess(message) {
    this.testResults.passed++;
    console.log(`✅ ${message}`);
  }

  logError(message, error) {
    this.testResults.failed++;
    console.log(`❌ ${message}: ${error.message}`);
    this.testResults.errors.push(`${message}: ${error.message}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2)}%`);

    if (this.testResults.errors.length > 0) {
      console.log('\n🔍 Errors:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n🎯 Cassandra QueryBuilder Tests Complete!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CassandraTest();
  tester.runAllTests().catch(console.error);
}

export default CassandraTest;
