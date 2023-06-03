const cron = require('node-cron');
const { BookingService } = require('../../services')

function scheduleCron() {
    cron.schedule('* */30 * * * *', async () => {
        console.log("Running every minute");
        await BookingService.cancelBookingCron();
    });
}

module.exports = scheduleCron;