const fs = require('fs');
const logger = require('./logger');
const filePath = JSON.parse(fs.readFileSync('./config/environment.json')).FileStorage.path;
const path = require('path');

function connectFiles(data){
    return new Promise ((res, rej) => {
        const dirName = getTodayDate();
        const dirPath = path.join(filePath, dirName);

        fs.mkdir(dirPath, {recursive: true}, (err) => {
            if (err) return rej(err);

            createFiles(data, dirPath);
        })
    });
}
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function createFiles(data, dirPath) {
    return new Promise((res, rej) => {
        if (!data.testData || !Array.isArray(data.testData)) {
            return rej(new Error('Invalid data format: Missing or invalid testData'));
        }
        const groupedData = data.testData.reduce((acc, item) => {
            const displayName = item["ExecutionList DisplayName"];
            if (!acc[displayName]) {
                acc[displayName] = [];
            }
            acc[displayName].push(item);
            return acc;
        }, {});
        const writePromises = Object.keys(groupedData).map(displayName => {
            const fileData = groupedData[displayName].map(item => JSON.stringify(item));
            const filename = `${displayName}.json`;
            const logfilepath = path.join(dirPath, filename);

            return new Promise((resolve, reject) => {
                try {
                    fs.writeFileSync(logfilepath, `[${fileData.join(',')}]`, 'utf8');
                    logger.info(`ResultFile save succeeded: ${logfilepath}`);
                    resolve();
                } catch (err) {
                    logger.error(`connectFiles error: ${err}`);
                    reject(err);
                }
            });
        });
        Promise.all(writePromises)
            .then(() => res())
            .catch(err => rej(err));
    });
};

async function getTestResultfromFileServer (){
    return new Promise(async (res, rej) => {
       try{
          const ctx = JSON.parse(fs.readFileSync(filePath));
          res(ctx);
       }catch(err){
        logger.error (`getTestResultfromFileServer error : ${err}`);
        rej (err);
       }
    })
}

async function createExecutionListfile (data){
    return new Promise(async (res, rej) => {
        try{
            let path = JSON.parse(fs.readFileSync('./config/environment.json')).ExecutionList.path;
            fs.writeFileSync(path, JSON.stringify(data), 'utf8', async (err) =>{
                logger.error(`createExecutionListfile error : ${err}`);
                rej();
            })
            logger.info(`ExecuteList file save sussecced.`);
            createGuideFile(path);      
            res();
        }catch(err){
            logger.error(`createExecutionListfile error : ${err}`);
            rej(err);
        }
    })
};


function createGuideFile(path) {
    fs.readFile(path, 'utf8', async (err, data) => {
        if (err) {
            logger.error(`createGuidefile file reading Error: ${err}`);
            return;
        }
    
        try {
            const jsonData = JSON.parse(data);
            let html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Execute Trigger</title>
                    <style>
                        table {
                            border-collapse: collapse;
                            width: 100%;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        .btn {
                            padding: 5px 10px;
                            color: white;
                            background-color: #007bff;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        .btn:hover {
                            background-color: #0056b3;
                        }
                            .schedule-form {
                            display: flex;
                            align-items: center;
                            margin-top: 10px;
                        }
                        .schedule-form input[type="text"] {
                            width: 150px; /* 원하는 너비로 조정 */
                            padding: 5px;
                            margin-right: 10px; /* 버튼과의 간격 */
                        }
                        .schedule-form button {
                            padding: 5px 10px;
                            color: white;
                            background-color: #007bff;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        }
                        .schedule-form button:hover {
                            background-color: #0056b3;
                        }
                    </style>
                </head>
                <body>
                    <table id="ExecuteTable">
                        <thead>
                            <tr>
                                <th>TestEvent (Ticket)</th>
                                <th>Unique ID</th>
                                <th>Execute Trigger</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
    
            jsonData.forEach(item => {
                html += `
                    <tr>
                        <td>${item["TestEvent DisplayName"]}</td>
                        <td>${item["TestEvent UniqueID"]}</td>
                        <td>
                        ${item["TestEvent ExecuteTrigger"]}
                        </td>
                        <td>
                           <div class="form-container">
                            <form action="/schedule-event" method="GET" class="schedule-form">
                                <input type="text" id="cronExpression-TT-2" name="cronExpression" required>
                                <button type="submit" class="btn">Submit</button>
                            </form>
                          </div>
                        </td>
                    </tr>
                `;
            });
            html += `
                        </tbody>
                    </table>
                    <script>
                        function handleButtonClick(trigger) {
                            fetch(trigger)
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Success:', data);
                                })
                                .catch((error) => {
                                    console.error('Error:', error);
                                });
                        }
                    </script>
                </body>
                </html>
            `;
    
            fs.writeFile('Execute_Trigger_List.html', html, 'utf8', () => logger.info("guide file is created."));
        } catch (error) {
            logger.error(`createGuidefile Error: ${error}`);
        }
    });
};

module.exports = {connectFiles, getTestResultfromFileServer, createExecutionListfile};