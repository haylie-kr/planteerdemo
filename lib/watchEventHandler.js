const moment = require('moment');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const executeCollector = require('./executeCollector');
const pattern = /ImportToExecutionLogTaskInfo process: Workspace (\w+) is used for ExecutionList (.+)/;
//20240724 사용 안 함
let _today, _yesterday, _logfile, watcher = null;
let lastFileSize, lastFileCount = 0;

async function watchEventHandler (){
    _logfile = await initialize();
    watcherForLog(_logfile);
    watcherForDir('./log');
}
async function initialize() {
    return new Promise(async (resolve, reject) => {
        try {
            const today = moment();
            const yesterday = moment().subtract(1, 'day');

            let logpath = path.join('./log', `ToscaAutomationObjectService_Log${today.format('YYYYMMDD')}.txt`);
            let existsToday = true;

            try {
                await accessFile(logpath);
            } catch (err) {
                console.error(`Today's log file not found: ${err.message}`);
                existsToday = false;
            }

            if (!existsToday) {
                logpath = path.join('./log', `ToscaAutomationObjectService_Log${yesterday.format('YYYYMMDD')}.txt`);
                try {
                    console.log(`Use the last log file :${logpath}`)
                    await accessFile(logpath);
                } catch (err) {
                    console.error(`Yesterday's log file also not found: ${err.message}`);
                    reject(new Error('Neither today nor yesterday log file found'));
                    return;
                }
            }

            const readStream = fs.createReadStream(logpath);
            const rl = readline.createInterface({
                input: readStream,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                const match = line.match(pattern);
                if (match) {
                        const body = JSON.stringify({"WorkSpace" : match[1], "Executionlist ID" : match[2]});
                   //     console.log(body);
                }
            });

            rl.on('close', () => {
                console.log('Finished reading initial log file.');
                resolve(logpath);
            });

        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}
function accessFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

function watcherForDir (directorypath){
    fs.readdir(directorypath, (err, files) => {
        if (err) {
            console.error(`디렉토리를 읽는 중 오류가 발생했습니다: ${err}`);
            return;
        }
        lastFileCount = files.length;
        console.log("log count : " , lastFileCount);
    });
    fs.watch(directorypath, (eventType, filename) => {
        fs.readdir(directorypath, (err, files) => {
            if (err) {
                console.error(`디렉토리를 읽는 중 오류가 발생했습니다: ${err}`);
                return;
            }            
            if(lastFileCount < files.length){
                const temp = files.map(filename => ({
                    name: filename,
                    time: fs.statSync(path.join(directorypath, filename)).mtime.getTime()
                })).sort((a, b) => b.time - a.time);   
                _logfile = path.join(directorypath, temp[0].name);
                watcher.close();
                lastFileCount = files.length;                
                watcherForLog(_logfile);
                console.log("log count : " , lastFileCount);
                console.log("changed log file :", _logfile);
            }            
        });
    })
}

function watcherForLog(_logfile) {
    const watcher = fs.watch(_logfile, (eventType, filename) => {
        if (eventType === 'change') {
            fs.stat(_logfile, (err, stats) => {
                if (err) {
                    console.error(`Error getting stats for file: ${err.message}`);
                    return;
                }

                const newFileSize = stats.size;

                if (newFileSize > lastFileSize) {
                    const readStream = fs.createReadStream(_logfile, { start: lastFileSize, end: newFileSize });

                    const rl = readline.createInterface({
                        input: readStream,
                        crlfDelay: Infinity
                    });

                    rl.on('line', (line) => {
                        const match = line.match(pattern);
                        if (match) {
                            const body = JSON.stringify({"WorkSpace" : "View", "Executionlist ID" : match[2]});
                            // console.log(body);
                            executeCollector("View", match[2]);
                        }
                    });

                    rl.on('close', () => {
                        console.log('Finished reading updated log file:', newFileSize);
                    });

                    lastFileSize = newFileSize;
                }
            });
        }
    });

    function stopWatching() {
        watcher.close();
        console.log('Watcher stopped.');
    }
  //  process.on('SIGINT', stopWatching);
}

module.exports = watchEventHandler;