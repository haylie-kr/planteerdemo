const https = require('https');
const fs = require('fs');
const logger = require('./logger');
const filePath = JSON.parse(fs.readFileSync('./config/environment.json')).ExecutionList.path;
const credential = JSON.parse(fs.readFileSync('./config/environment.json')).ToscaServer;
const path = require('path');

function executeUpdateAll (){
    return new Promise((rs,rej) => {
        let option = {
            hostname: credential.baseUrl,
            path: "/rest/toscacommander/View/task/UpdateAll",
            method: 'GET',
            headers: {
                'Authorization': `${credential.accessToken}`,
                'Authmode' : 'pat'
            }
        };
        try{
            let req = https.request(option, (res) => {
                var responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on ('end', async () => { 
                            logger.info(`UpdateAll : Receive data [${responseData}]`);
                            logger.info(`View side UpdateAll has completed.`);
                              rs(); 
                                      
                });
                res.on ('error', async(err) => {
                    logger.error(`View side UpdateAll Error : ${err}`);
                    rej(err);
                })
            });

            req.on('error', async (error) => {
                logger.error(`View side UpdateAll Error: ${error}`);
                rej(error);
            });                
            req.write('');
            req.end(); 
        }catch(err){
            logger.error(`View side UpdateAll Error: ${err}`);
            rej(err);
        }
    })
}
function executeHandler(eventname){
    return new Promise (async (rs, rej) => {

        try{
            const jsondata = JSON.parse(fs.readFileSync(filePath));
            const executeobj = jsondata.find(obj => obj["TestEvent DisplayName"] === eventname);
            if(executeobj){
                logger.info(`/api/v2/execute for ${eventname} processing....`);
                executeUpdateAll()
                .then(() => {
                    let options = {
                        hostname: credential.baseUrl,
                        path: executeobj["TestEvent Execute"],
                        method: 'GET',  
                        headers: {
                            'Authorization': `${credential.accessToken}`,
                            'Authmode' : 'pat'
                        }
                    };
                    try{
                        const req = https.request(options, (res) => {
                            var responseData = '';
                            res.on('data', (chunk) => {
                                responseData += chunk;
                            });
                            res.on ('end', async () => {
                                if(responseData == '')
                                    rej("AOS Server Check");
                                else if (responseData.includes("00000000-0000-0000-0000-000000000000"))
                                    {
                                        rej("Executionlist might be checkout");
                                    }
                                else{
                                    logger.info(`${executeobj["TestEvent Execute"]} is executed.`);
                                    logger.info(`Execute : Receive data [${responseData}]`);
                                    rs();
                                }
                            });
                            res.on ('error', async(err) => {
                                logger.error(`error is occuried with ${executeobj["TestEvent Execute"]} : ${err}`);
                                rej(err);
                            })
                        });
            
                        req.on('error', async (error) => {
                            logger.error(`dataSendHandler Error: ${error}`);
                            rej(error);
                        });                
                        req.write('');
                        req.end(); 
                    }catch(e){
                        logger.error(e);
                    }
                   
                })
                .catch((e) => {
                    logger.error(e);
                })
               
            }
        }
        catch(err){
            logger.info(`executeHandler : ${err}`);
        }
    })
}

module.exports = executeHandler;