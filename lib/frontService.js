const resultService = require('./resultService');
const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getResultforFront(){
    return new Promise (async (rs, rj) =>{
        try{
          const dirName = getTodayDate();
          const StoragePath = await JSON.parse(await fs.readFile('./config/environment.json')).FileStorage.path;  
          const DirPath = path.join(StoragePath,dirName);
          try{
            await fs.access(DirPath);
          }
          catch(err){
            logger.info(`Create new dir : ${err}`);
            await fs.mkdir(DirPath, {recursive:true}, (err) => {
              if(err) rj(err);
            })
          }    
          const files = await fs.readdir(DirPath);
          const faqPromises = files.map(async(file) => {
            try{
              const filePath = path.join(DirPath, file);
              const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
              return {
                  title: file.replace('.json', ''),
                  answer: resultService.getResult(data)
              };
            }catch(err){
              logger.error(`Error processing file ${err}`);
              throw err;
            }            
        });
        const faq = await Promise.all(faqPromises);
        rs(faq);
      }
        catch (err){
          logger.error(`getResultforFront : ${err}`);
          rj(err);
        }
        
    });
};

function getTriggerforFront(){
  return new Promise (async (res, rej) => {
      try{
        let path = await JSON.parse(await fs.readFile('./config/environment.json')).ExecutionList.path;
        const lists = await JSON.parse(await fs.readFile(path));
        res(lists);
      }
      catch(err) {
        logger.error(`getTriggerforFront : ${err}`);
        rej(err);
      }
  });
};


module.exports = {getResultforFront, getTriggerforFront};