const https = require('https');

const interval = 30000;
const requests = [];

function CheckStatus() {
    requests.forEach(request => {
        let url = 
        https.get(request.url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const status = JSON.parse(data).status;
                    console.log(`Status for ${request.id}: ${status}`);
                    
                    if (status === 'Complete') {
                        performBusinessLogic(request);
                    }
                } catch (err) {
                    console.error('Error parsing status:', err.message);
                }
            });
        }).on('error', (err) => {
            console.error('Error for request', request.id, ':', err.message);
        });
    });
}

function SetMonitor (eventId) {
    requests.push(eventId);
    setInterval(CheckStatus, interval);
}

module.exports = SetMonitor;