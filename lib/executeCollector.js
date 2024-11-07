const { spawn } = require('child_process');
const path = require('path');
const _Event = require('../lib/include');
const logger = require('./logger');
const iconv = require('iconv-lite');

function executeCollector(workspace, executionlist) {
    try{

        let _Path = process.env.TRICENTIS_SEARCH;
        if (!_Path) {
            logger.error("Can't find out environment path 'TRICENTIS_SEARCH'");
            return;
        }
        if (_Path.endsWith(';')) {
            _Path = _Path.slice(0, -1);
        }
    
        const exeFilePath = path.join(_Path, 'Planteer.reporter.collector.exe');
        let _output = '';
        const parameters = [workspace, executionlist];
    
        const child = spawn(exeFilePath, parameters, { maxBuffer : 1024*1024, encoding : 'utf8'});
        child.stdout.on('data', (data) => {       
            _output += iconv.decode(data, 'euc-kr');               
        });
    
        child.stderr.on('data', (data) => {
            logger.error(`stderr: ${data}`);
        });
    
        child.on('close', async (code) => {
            try{                
                logger.info(_output);
                const jsondata = JSON.parse(_output);
                const TestSuite = new Array();
                var credential = _Event.config.credential;
                _Event.storage.connectFiles(jsondata);
                for(const TestCase of jsondata.testData)
                {
                   // const ticketname = TestCase["ExecutionList DisplayName"].split(_Event.seperator);
                   const ticketname = TestCase["ExecutionList DisplayName"];
                    TestSuite.push({Testcase : await _Event.reportHandler(TestCase), ticket : ticketname});    
                }
                 _Event.dataUpdateHandler(TestSuite, credential)
                 .then(async ()=>{
                    TestSuite.length = 0;       
                    logger.info("executeCollector : Jira update is completed.");
                 })        
                 .catch(async (err) => {
                    logger.error(`/api/v1/report Error 500, Internal Server Error in dataUpdateHandler: ${err}`);
                });
            }catch(err){
                logger.error(`/api/v1/report Error 500, Internal Server Error : ${err}`);
                return;
            };   
            logger.info(`child process exited with code ${code}`);
        });
    }catch(e){
        logger.error(`executeCollecto : ${e}`);
    }
}

module.exports = executeCollector;