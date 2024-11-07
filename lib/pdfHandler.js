const logger = require('../lib/logger');
const { spawn } = require('child_process');
const fs = require('fs');
const iconv = require('iconv-lite');
async function mkrpt(){
    try{
        let config = JSON.parse(fs.readFileSync('./config/environment.json'));
        let _Path = config.ExecutionFile.path;
        if (!_Path) {
            logger.error("Can't find out the .bat file.");
            return;
        }    
        let _output = '';
        logger.info(`Path to .bat file: ${_Path}`);
        const child = spawn(_Path, {shell: true, maxBuffer : 1024*1024, encoding : 'utf8'});
        child.stdout.on('data', (data) => {_output += iconv.decode(data, 'euc-kr'); });
    
        child.stderr.on('data', (data) => {
            logger.error(`stderr: ${iconv.decode(data, 'euc-kr')}`);
        });
    
        child.on('close', async (code) => {
           logger.info("Process close");
        });
    }catch(e){
        logger.error(`pdfHandler : ${e}`);
    }
};
module.exports = mkrpt;