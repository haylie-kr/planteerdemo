const fs = require('fs');
const logger = require('./logger');
const CronJOB = require('./registerCronjob');
async function setCronjob (data) {
 const infoPath = JSON.parse(fs.readFileSync('./config/environment.json')).ExecutionList.path;  
 fs.readFile(infoPath, 'utf8', (err, filedata) => {
    if (err) {
        logger.error('Error reading the environment file:', err);
        return;
    }
    let jsonArray = JSON.parse(filedata);
    let isJobChanged = 1;
    let eventName = '';
    jsonArray.forEach(obj => {
        if(obj.hasOwnProperty("TestEvent UniqueID") && (obj["TestEvent UniqueID"].trim() === data.uniqueID.trim()))
        {    
            obj["TestEvent Schedule"] = data.cronExpression; 
            eventName = obj["TestEvent DisplayName"];
            isJobChanged = 0;               
            CronJOB.registerCronjob({"TestEvent DisplayName" : eventName, "TestEvent UniqueID": data.uniqueID, "TestEvent Schedule":data.cronExpression });
        }
    });
    if(isJobChanged)
        return;
    
    fs.writeFile(infoPath, JSON.stringify(jsonArray, null, 2), 'utf8', (err) => {
        if (err) {
            logger.error(`Error writing to the file for new schedule ${eventName}: ${err}`);
            return;
        }
        logger.info(`Schedule of ${eventName} has been updated successfully.`);
    });


 });

};

module.exports = setCronjob;