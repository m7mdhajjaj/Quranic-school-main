const cron = require('node-cron');
const DeviceToken = require('../../schema/DeviceToken');

/**
 * Job to clean up old/invalid FCM tokens
 * Runs daily at 3 AM
 */
class TokenCleanupJob {
  static start() {
    // Run daily at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('🧹 Starting FCM token cleanup job...');
      
      try {
        // Remove tokens older than 90 days with no recent usage
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const result = await DeviceToken.deleteMany({
          lastUsed: { $lt: ninetyDaysAgo }
        });
        
        console.log(`✅ Removed ${result.deletedCount} old FCM tokens`);
      } catch (error) {
        console.error('❌ Error in token cleanup job:', error);
      }
    });
    
    console.log('🔧 FCM token cleanup job scheduled (daily at 3 AM)');
  }
}

module.exports = TokenCleanupJob;
