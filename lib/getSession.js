const https = require('http');
const getTime = require('./getTime');

async function getSession (credential) {
    return new Promise(async (res, rej)=> {

        try{            
            const options = {
              hostname: credential.baseUrl,
              port: credential.port,
              path: '/rest/auth/1/session',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            };
            const body = JSON.stringify({
                "username" : credential.username,
                "password" : credential.password
            });
            var req = https.request(options, (session) => {
                var sessionData = '';
                session.on('data', (chunk) => {
                    sessionData += chunk;
                });
                session.on ('end', async () => {
                    logger.info(`Received data [ ${sessionData} ]`);                    
                    res(sessionData);
                });
            });

            req.on('error', async (error) => {
                logger.error(`getSession Error: ${error}`);
                rej(error);
            });
            req.write(body);
            req.end( async () => {logger.info(`Send Data [ ${body} ]`)}); 
        }catch(err){
            logger.error(`getSession Error : ${err}`);
            rej(err);
        }

    });
};

module.exports = getSession;
