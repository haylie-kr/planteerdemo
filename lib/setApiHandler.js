const logger = require('../lib/logger');
async function setExecutionList (data){
    return new Promise(async (res, rej) => {
       try{
        const Content = new Array();
        const workspace = data["WorkSpace"].name;
        for(const item of data["Execution Data"]){
            const api = await setTrigger(item["TestEvent UniqueID"], workspace);
            const triggerapi = `http://${JSON.parse(require('fs').readFileSync('./config/environment.json')).PlantServer.baseUrl}:${JSON.parse(require('fs').readFileSync('./config/environment.json')).PlantServer.port}/api/v2/execute?eventname=${item["TestEvent DisplayName"]}`;
            Content.push({
                "TestEvent DisplayName" : item["TestEvent DisplayName"],
                "TestEvent UniqueID" : item["TestEvent UniqueID"],
                "TestEvent ExecuteTrigger" : `${triggerapi}`,
                "TestEvent Execute" : api,
                "TestEvent Schedule" : "* * * * *"
            });
        }
        res(Content);
       }catch(err)
       {
        logger.error(`setExecutionList : ${err}`);
        rej(err);
       }
    });
};

async function setTrigger(UID, workspace){
    return new Promise(async (res, rej) => {
        try
        { //workspace name : "View"
            const endpoint_path = JSON.parse(require('fs').readFileSync('./config/environment.json')).ExecutionList.endpoint;
            const workspace = "View";
          const str = `${endpoint_path}/${workspace}/object/${UID}/task/ExecuteNow`
            res(str);
        }catch(err){
            logger.error(`setExecutionList : ${err}`);
            rej(err);
        }
    });
}

module.exports = { setExecutionList, setTrigger };