const _handler = require('./setData');
const logger = require('./logger');

async function dataHandler(data){
 return new Promise (async (res, rej) => {
   for(const TestCase of data["test_cases"])
   {
     if(TestCase["ExecutionTestCase Result"] === "Pass"){
      await _handler.setJiraContent(TestCase)
      .then((v) => {
        res(v);
      })
      .catch(async (error) => {
        logger.error(`dataHandler for Pass:${error}`);
      });
    }
    else if (TestCase["ExecutionTestCase Result"] === "Fail")
    {
      await _handler.setTableStructure(TestCase)
      .then((v) => {
        res(v);
      })
      .catch(async (error) => {
        logger.error(`dataHandler for Fail: ${error}`);
      });
    }
   }
   res();
 })
};

module.exports = dataHandler;