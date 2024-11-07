const express = require('express');
const infos_router = express.Router();
const _Event = require('../lib/include');
const logger = require('../lib/logger');

infos_router.get('/api/v2/getTestresult', async function (req, res, next) {
    try{
        const context = await _Event.storage.getTestResultfromFileServer();
        res.status(200).json({
            code : 200,
            message : context
        });        
        logger.info("Send data [/api/v2/getTestresult res.send(200)]");
    }catch(err){
        res.status(405).send('Error 405, Api FileSystem Error');
        logger.error("Error 405, Api FileSystem Error :"+err);
        return;
    }    
});

infos_router.post('/api/v2/signal', async function(req, res, next){
    try{ 
        const infos = req.body["Executionlist Name"].split(_Event.seperator);
        _Event.executeCollector(infos[1],infos[0]);        
        res.status(200).json({
            code : 200,
            message : "accept"
        });
        logger.info("Send data [/api/v2/signal res.send(200)]");
    }catch(err){
        res.status(500).send(err);
        logger.error("/api/v2/signal Error 500, Internal Server Error :"+err);
        return;
    }
});
infos_router.get('/api/v2/execute', async function(req,res,next){
    _Event.executeHandler(req.query.eventname)
    .then(() => {  
        res.status(200).json({
            code : 200,
            message : req.query.eventname
        });
        logger.info("Send data [/api/v2/execute res.send(200)]");
        logger.info("execute TestEvent : "+req.query.eventname);
    })
    .catch((err) => {
        res.status(400).json({
            code : 400,
            message : err
        });
        logger.info(`dataSendHandler ${err}`);
    })
    
});

infos_router.get('/api/v2/test', async function(req, res, next) {  
    res.status(200).json({
        code : 200,
        message : "server is running"
    });
    logger.info("Send data [/api/v2/test res.send(200)]");
});

infos_router.post('/schedule-event', async function(req, res, next) {
    var cronExpression = req.body.cronExpression;
    const uniqueID = req.body.uniqueID;
    const cronRegex = /^(\*|([0-5]?\d)(\/[0-5]?\d)?(,\*|,[0-5]?\d(-[0-5]?\d)?)*)\s+(\*|([0-5]?\d)(\/[0-5]?\d)?(,\*|,[0-5]?\d(-[0-5]?\d)?)*)\s+(\*|([01]?\d|2[0-3])(\/[01]?\d|\/2[0-3])?(,\*|,([01]?\d|2[0-3])(-[01]?\d|-[2][0-3])?)*)\s+(\*|(0?[1-9]|[12]\d|3[01])(\/(0?[1-9]|[12]\d|3[01]))?(,\*|,(0?[1-9]|[12]\d|3[01])(-[0-9]|-[12]\d|-[3][01])?)*)\s+(\*|(0?[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\/(0?[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))?(,\*|,(0?[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(-(0?[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))?)*)\s+(\*|([0-7]|sun|mon|tue|wed|thu|fri|sat)(\/([0-7]|sun|mon|tue|wed|thu|fri|sat))?(,\*|,([0-7]|sun|mon|tue|wed|thu|fri|sat)(-([0-7]|sun|mon|tue|wed|thu|fri|sat))?)*)$/;
    if(cronExpression.includes('none')){
        _Event.setCronjob({cronExpression:cronExpression, uniqueID:uniqueID});        
        res.json({ message: 'cronJob has deleted.', code:'delete', data: req.body });
    }
    else if(!cronRegex.test(cronExpression)){     
        res.json({ message: 'Invalid cron expression format.', code:'error', data: req.body });
    }
    else{    
        _Event.setCronjob({cronExpression:cronExpression, uniqueID:uniqueID});  
        res.json({ message: 'Event scheduled successfully!', code:'ok', data: req.body });
    }
        

})

module.exports = infos_router;

