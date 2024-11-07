const https = require('https');
const getSession = require('./getSession');
const logger = require('./logger');

async function dataSendHandler(data, credential){
    return new Promise(async (res, rej) => {
        try{          
            const Today = new Date();
            const isoDate = Today.toISOString().split('T')[0];
            
           getSession(credential)
           .then(session => {            
            const create_options = {
                hostname: credential.baseUrl,
                port: credential.port,
                path: '/rest/api/2/issue',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cookie' : `${session.name}=${session.value}`
                }
              };
          
              const bodyData = JSON.stringify({body : `${data}`});
  
              const req = https.request(create_options, (res) => {
                  var responseData = '';
                  res.on('data', (chunk) => {
                      responseData += chunk;
                  });
                  res.on ('end', async () => {
                      logger.info(`Receive data [${responseData}]`);
                  });
              });
  
              req.on('error', async (error) => {
                  logger.error(`dataSendHandler Error:  ${error}`);
              });
              
              req.write(bodyData);
              req.end( async () => {logger.info(`Send data [ ${bodyData} ]`)}); 
           });
        }catch(err){
            logger.error(`dataSendHandler : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
        res();
    })
}
module.exports = dataSendHandler;