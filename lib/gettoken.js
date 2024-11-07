const https = require('https');
const fs = require('fs').promises;

let url,id,secret,access_token, token_type;
(async() => {
    const data = await fs.readFile('../config/environment.json', 'utf8');    
    const content = JSON.parse(data);
    url = content.Credit.token_Url;
    id = content.Credit.client_ID;
    secret = content.Credit.client_SECRET;
console.log(secret);
    const options = {
        hostname: url,
        port: 443,
        path: '/connect/token',
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
            'X-Tricentis': 'OK',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength('grant_type=client_credentials')
        }
    };

    const postData = 'grant_type=client_credentials';
    const req = https.request(options, (res) => {
        let data = '';
    
        res.on('data', (chunk) => {
            data += chunk;
        });
    
        res.on('end', () => {
            try {
                const responseData = JSON.parse(data);
                console.log('Access Token:', responseData.access_token);
                access_token = responseData.access_token;
                token_type = responseData.token_type;
            } catch (e) {
                console.error('Error parsing response:', e.message);
            }
        });
    });    
    req.on('error', (e) => {
        console.error('Error fetching token:', e.message);
    });    
    req.write(postData);    
    req.end();

    const project_req = https.request(options, (res) => {

    });

})();