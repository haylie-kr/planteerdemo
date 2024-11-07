const cron = require('node-cron');
const fs = require('fs');
const executeHandler = require('./executeHandler');
const logger = require('./logger');
let cronJobs = {};

const infoPath = JSON.parse(fs.readFileSync('./config/environment.json')).ExecutionList.path;  
function deleteCronjob(uniqueID) {
    if (cronJobs[uniqueID]) {
        cronJobs[uniqueID].stop();  
        delete cronJobs[uniqueID];  
        logger.info(`Cron job with uniqueID: ${uniqueID} has been deleted.`);
    } else {
        logger.info(`No cron job found with uniqueID: ${uniqueID}.`);
    }
}

async function registerCronjob(job) {
    const displayName = job["TestEvent DisplayName"];
    const uniqueID = job["TestEvent UniqueID"];
    const schedule = job["TestEvent Schedule"];

    if(schedule.includes('none')){
        deleteCronjob(uniqueID);
        return;
    }

    if (cronJobs[uniqueID]) {
        cronJobs[uniqueID].stop();
    }
    cronJobs[uniqueID] = cron.schedule(schedule, async () => {
        try {
            await executeHandler(displayName);
            logger.info(`Cron job executed successfully for TestEvent: ${displayName}`);
        } catch (err) {
            logger.error(`Error executing cron job for ${displayName}:`, err);
        }
    });
}

async function initializeCronjob() {
    try {
        const data = fs.readFileSync(infoPath, 'utf8');
        const jobs = JSON.parse(data);
        jobs.forEach(job => {
            registerCronjob(job);
        });
        logger.info('All cron jobs have been registered.');
    } catch (err) {
        logger.error('Error reading the cronjobs file:', err);
    }
}

module.exports = { registerCronjob, initializeCronjob };