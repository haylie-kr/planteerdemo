const https = require('https');
const getSession = require('./getSession');
const logger = require('./logger');

async function dataCommentHandler(data, credential) {
    return new Promise(async (res, rej) => {
        try {
            const authHeader = 'Basic ' + Buffer.from(credential.username + ':' + credential.password).toString('base64');
            const maxLength = 32000;
            let currentChunk = '';
            let beforeTicket = '';
            let newDataLength = 0;

            for (let i = 0; i < data.length; i++) {
                const options = {
                    hostname: credential.baseUrl,
                    port: credential.port,
                    path: `/rest/api/2/issue/${beforeTicket}/comment`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${authHeader}`
                    }
                };
                newDataLength = currentChunk.length + data[i].Testcase.length;
                logger.info(`Processing for ${data[i].ticket}`);
                if (beforeTicket !== '' && beforeTicket !== data[i].ticket) {
                    if (currentChunk.length) {
                        await sendChunk(currentChunk, options);
                        currentChunk = '';
                        newDataLength = 0;
                    }
                }
               
                if (newDataLength > maxLength) {
                    await sendChunk(currentChunk, options);
                    currentChunk = '';
                    newDataLength = data[i].Testcase.length;  
                }

                currentChunk += (data[i].Testcase+"\n");
                beforeTicket = data[i].ticket;
            }
            if (currentChunk.length) {
                const options = {
                    hostname: credential.baseUrl,
                    port: credential.port,
                    path: `/rest/api/2/issue/${beforeTicket}/comment`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${authHeader}`
                    }
                };
                await sendChunk(currentChunk, options);
            }
        } catch (err) {
            logger.error(`dataCommentHandler : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
        res();
    });
}

async function sendChunk(body, options) {
    return new Promise((resolve, rej) => {
        const bodyData = JSON.stringify({"body": `${body}`});
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', async () => {
                if (responseData.includes('errorMessages')) {
                    logger.info(`Jira update is failed ${responseData}`);
                    rej(responseData);
                } else {
                    logger.info(`Receive data [ ${responseData} ]`);
                    resolve();
                }
            });
        });

        req.on('error', async (error) => {
            logger.error(`sendChunk Error: ${error}`);
            rej(error);
        });
                
        req.write(bodyData);
        req.end(async () => {
            logger.info(`Send data [ ${bodyData} ]`);
        });
    });
}
module.exports = dataCommentHandler;