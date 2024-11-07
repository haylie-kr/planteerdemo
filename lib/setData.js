const logger = require('./logger');
async function setTableStructure(data){
   return new Promise(async (res, rej) => {
    try{
        await setTestStepData(data)
        .then(v => {
            let Content = '';  
            if(v)
                Content = `${data["ExecutionTestCase DisplayName"]} : Fail\n||TestStep||Result||Date||LogInfo||Location||\n${v}\n`;
            else
                Content = `${data["ExecutionTestCase DisplayName"]} : Fail\n|${data["ExecutionTestCase Loginfo"]}|`;
        res(Content);
        });        
    }catch(err){
        logger.error(`setTableStructure : Can't make Jira Content. Plaese Check the error and data: ${err} [Data] : ${data}`);
        rej(err);
    }
   });
}

async function setJiraContent(data){
    return new Promise(async (res, rej) => {
        try{
            let Content =  `${data["ExecutionTestCase DisplayName"]} : Pass\n `;
            res(Content.replace(/\s/g,''));
        }catch(err){
            logger.error(`setJiraContent : Can't make Jira content. Please Check the error and data: ${err} [Data] : ${data}`);
            rej(err);
        }
    });
}

async function setTestStepData(data){
    return new Promise(async (res, rej) => {
        try{
            const Content = new Array();
            for(const TestStep of data["test_step"]){
                if(TestStep["ExecutionTestStep Result"] === "Fail")
                   Content.push(await setTestStepTableStructure(TestStep));
                if(TestStep["ExecutionTestStep DisplayName"] === "CleanUp Scenario")
                   Content.push(await setScreenshotPath(TestStep));
            }
            res(Content.join("\n"));
        }catch(err){
            logger.error(`setTestStepData : Failed. Please Check the error and data: ${err} [Data] : ${data}`);
            rej(err);
        }
    });
}

async function setTestStepTableStructure(data){
    return new Promise(async (res, rej) => {
        try{
            const color = data["ExecutionTestStep Result"] === "Pass" ? "#57d9a3" : "#de350b";
            const Content = `| ${data["ExecutionTestStep DisplayName"]} | {color:${color}}${data["ExecutionTestStep Result"]}{color} | ${data["ExecutionTestStep StartTime"]} | ${escapeSpecialCharacters(data["ExecutionTestStep Loginfo"])}  | ${data['ExecutionTestStep NodePath']} |`;
            res(Content);
        }catch(err){
            logger.error(`setTestStepTableStructure : Failed. Please Check the error and data: ${err} [Data] : ${data}`);
            rej(err);
        }
    });
};

async function setScreenshotPath(data){
    return new Promise(async (res, rej) => {
        try{
            const color = data["ExecutionTestStep Result"] === "Pass" ? "#57d9a3" : "#de350b";
        // Screenshot Path
           const Content = `| ${data["ExecutionTestStep DisplayName"]} | {color:${color}}${data["ExecutionTestStep Result"]}{color} | ${data["ExecutionTestStep StartTime"]} | ${await escapeSpecialCharacters(data["ExecutionTestStep Loginfo"])}  | ${await escapeSpecialCharacters(await getScreenshot(data["test_step_value"]))} |`;
        // Screenshot Thumnail
       // const Content = `| ${data["ExecutionTestStep DisplayName"]} | {color:${color}}${data["ExecutionTestStep Result"]}{color} | ${data["ExecutionTestStep StartTime"]} | ${await escapeSpecialCharacters(data["ExecutionTestStep Loginfo"])}  | !${await escapeSpecialCharacters(await getScreenshot(data["test_step_value"]))}|thumbnail! |`;
        res(Content);
        }catch(err){
            logger.error(`setScreenshotPath : Failed. Please Check the error and data: ${err} [Data] : ${data}`);
            rej(err);
        }
    });
}

async function getScreenshot(data){
  return new Promise(async (res, rej)=>{
    try{
        for(const Stepvalue of data)
        {
          if(Stepvalue["ExecutionTestStepValue DisplayName"] === "Take a Snapshot") //need to modify "Take a Snapshot"
          { 
            //resolve the path
           // res(Stepvalue["ExecutionTestStepValue Detail"]);
           //resolve the file
           let filename = await require('path').basename(Stepvalue["ExecutionTestStepValue Detail"]);
           res(await require('path').basename(Stepvalue["ExecutionTestStepValue Detail"]));
          }
        }
        res("\x20");
    }catch(err){
      logger.error(`getScreenshot : Failed. Please Check the error and data: ${err} [Data] : ${data}`);
        rej(err);
    }
  })
}
function escapeSpecialCharacters(str) {
    const escapeMap = {
        '"': '\\"',
        '\\': '\\\\',
        '\n': '\\n',
        '\t': '\\t',
        '\r': '\\r'
    };
    return str.replace(/["\\\n\t\r]/g, match => escapeMap[match]);
}
module.exports = {
    setTableStructure,
    setJiraContent
};