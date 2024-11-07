const https = require('https');
const getSession = require('./getSession');
const logger = require('./logger');
const attachmentSendHandler = require('./attachmentSendHandler');

async function resultHandler (data, credential){
    return new Promise(async (res, rej) => {
        let va = data.result.toLowerCase();
        if(va == "pass"){
            sendDataForPass(data, credential)
            .then(()=> {res();})
            .catch((err) => {rej(err);})
        }
        else if (va == "fail"){
            sendDataForFail(data, credential)
            .then(()=> {res();})
            .catch((err) => {rej(err);})
        }
        else if (va == "report")
        {
            sendDataForReport(data, credential)
            .then(()=> {res();})
            .catch((err) => {rej(err);})
        }
        else{
            logger.info(`invaild data : ${va}`);
            rej("result filed is empty.");
        }
    })
};

async function sendDataForPass (data, credential)
{
    return new Promise (async (res, rej) => {
        try {
            const options = await setOption(data, credential);
            if(data.TestCase == "") rej("TestCase Field is empty.")
            await sendChunk(`${data.TestCase} : ${data.result}`, options);
            res();
        } catch (err) {
            logger.error(`SendDataforPass : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
    })
}

async function sendDataForReport (data, credential){
    return new Promise (async (res, rej) => {
        try {           
            if(data.filename === "") rej("filename filed is empty.");   
            if(data.Ticket === "") rej("Ticket filed is empty.");
            const file = await require('path').basename(data.filename);
            const options = await setOption(data, credential);
            attachmentSendHandler(data, file, credential)
            .then (async () => {
                let extension = require('path').extname(file).toLowerCase();
                let content = "";
                if (['gif', 'jpg', 'jpeg', 'png', 'bmp'].some(ext => extension.endsWith(ext))) {
                    content = `!${file}|thumbnail!`;
                } 
                else if (['pdf', 'doc', 'xlsx', 'htm', 'html', 'json', 'txt', 'xls', 'docx'].some(ext => extension.endsWith(ext))) {
                    content = `[^${file}]`;
                }
                else {logger.error('Handle unsupported extensions');}
                await sendChunk(`Daily Report : ${content} `, options)
                .then(() => {res()})
                .catch(() => {rej()})
            })
            .catch(() => {rej()});
        } catch (err) {
            logger.error(`sendDataForFail : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
    })
}

async function sendDataForFail (data, credential){
    return new Promise (async (res, rej) => {
        try {
           
            if(data.filename === "") rej("filename filed is empty.");
            if(data.TestCase === "") rej("TestCase filed is empty.");     
            if(data.Ticket === "") rej("Ticket filed is empty.");
            const file = await require('path').basename(data.filename);
            const options = await setOption(data, credential);
            attachmentSendHandler(data, file, credential)
            .then (async () => {
                let extension = require('path').extname(file).toLowerCase();
                let content = "";
                if (['gif', 'jpg', 'jpeg', 'png', 'bmp'].some(ext => extension.endsWith(ext))) {
                    content = `!${file}|thumbnail!`;
                } 
                else if (['pdf', 'doc', 'xlsx', 'htm', 'html', 'json', 'txt', 'xls', 'docx'].some(ext => extension.endsWith(ext))) {
                    content = `[^${file}]`;
                }
                else {logger.error('Handle unsupported extensions');}
                await sendChunk(`${data.TestCase} : ${data.result} : ${content} `, options)
                .then(() => {res()})
                .catch(() => {rej()})
            })
            .catch(() => {rej()});
        } catch (err) {
            logger.error(`sendDataForFail : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
    })
}

async function setOption(data, credential){
    const authHeader = 'Basic ' + Buffer.from(credential.username + ':' + credential.password).toString('base64');
    let Ticket = data.Ticket;
    const options = {
        hostname: credential.baseUrl,
        port: credential.port,
        path: `/rest/api/2/issue/${Ticket}/comment`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authHeader}`
        }
    }
    return options;
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
                    logger.info(`Jira update is failed : ${responseData}`);
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

module.exports = resultHandler;