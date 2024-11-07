const https = require('https');
const getSession = require('./getSession');
const logger = require('./logger');
const FormData = require('form-data');
const path = require('path');

async function attachmentSendHandler(data, file, credential){
    return new Promise(async (resolve, rej) => {
        try{          
            const Today = new Date();
            const isoDate = Today.toISOString().split('T')[0];
            const authHeader = 'Basic ' + Buffer.from(credential.username + ':' + credential.password).toString('base64');
            let form = new FormData();
            let filepath = path.join('./screenshot', file);
            let contenttype = getContentType(filepath);
            const attachment = require('fs').readFileSync(filepath);
            
            if(filepath.includes('png') || filepath)
            form.append ('file', attachment, {filename : file, contentType: contenttype});
   
            const create_options = {
                body : form,
                hostname: credential.baseUrl,
                port: credential.port,
                path: `/rest/api/2/issue/${data.Ticket}/attachments`,
                method: 'POST',
                headers: form.getHeaders({
                    'Authorization': authHeader,
                    'X-Atlassian-Token': 'nocheck'
                })
              };          
              const req = https.request(create_options, (res) => {
                  var responseData = '';
                  res.on('data', (chunk) => {
                      responseData += chunk;
                  });
                  res.on ('end', async () => {
                      logger.info(`Receive data [ ${responseData} ]`);  
                      resolve();                 
                  });
              });
  
              req.on('error', async (error) => {
                  logger.error(`attachmentSendHandler Error: ${error}`);
                  rej();
              });
              form.pipe(req);
              req.end( async () => {logger.info(`Send data [ ${data.filename} ]`)}); 
        }catch(err){
            logger.error(`attachmentSendHandler : Can't report to JIRA. Please check the error : ${err}`);
            rej(err);
        }
    })
}

function getContentType(filepath){
    const extension = path.extname(filepath).toLowerCase(); 

    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.bmp':
            return 'image/bmp';
        case '.pdf':
            return 'application/pdf';
        case '.xlsx' : 
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        case '.htm':
        case '.html':
            return 'text/html';
        case '.json':
            return 'application/json';
        case '.txt':
            return 'text/plain';
        case '.xls' :
            return 'application/vnd.ms-excel';
        case '.doc' :
            return 'application/msword';
        case '.docx' :
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default:
            return null;
    }
}
module.exports = attachmentSendHandler;