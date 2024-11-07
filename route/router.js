const express = require('express');
const multer = require('multer');
const router = express.Router();
const _Event = require('../lib/include');
const logger = require('../lib/logger');
const TestSuite = new Array();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'screenshot');
    },
    filename: function (req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.post('/api/v1/report', async function(req, res, next){    
    const data = req.body;
    if(!data|| data.length === 0){
        res.status(400).json({
            code : 400,
            message : "missing data"
        });
        logger.info("/api/v1/report Error 400, missing data");
        return;
    }    
    var credential = _Event.config.credential;
    try{
        _Event.storage.connectFiles(data);
        for(const TestCase of data.testData)
        {
            //executor와 통일할 것
            const ticketname = TestCase["ExecutionList DisplayName"];
            TestSuite.push({Testcase : await _Event.reportHandler(TestCase), ticket : ticketname});    
        }
         _Event.dataUpdateHandler(TestSuite, credential)
         .then(async ()=>{
            TestSuite.length = 0;            
            res.status(200).json({
                code :200,
                message : "accept"
            });
            logger.info("Send data [/api/v1/report res.send(200)]");
            logger.info("Jira update is completed");
         })        
         .catch(async (err) => {
            res.status(500).send(err);
            logger.error("/api/v1/report Error 500, Internal Server Error in dataUpdateHandler:"+err);
        });
    }catch(err){
        res.status(500).send(err);
        logger.error("/api/v1/report Error 500, Internal Server Error :"+err);
        return;
    };   
});

router.post('/api/v1/upload', upload.single('file'), async function (req, res, next){
    try{     
        res.status(200).json({
            code : 200,
            message : "the file is saved."
        });
    }catch(err){
        res.status(400).send('Error 400, Can not upload to Support Server');
        logger.error("/api/v1/upload Error 400, Can not upload to Support Server :"+err);
    }
});

router.get('/api/v1/mkrpt', async function (req, res, next){
    try{ 
        _Event.getReports();    
        res.status(200).json({
            code : 200,
            message : "accepted."
        });
    }catch(err){
        res.status(400).send('Error 400, Can not make PDF reports');
        logger.error("/api/v1/mkrpt Error 400, Can not make PDF reports:"+err);
    }
});

router.post('/api/v1/result', async function(req, res, next) {      
    var credential = _Event.config.credential;
    _Event.resultHandler(req.body, credential)
    .then(async () => {
        res.status(200).json({
            code : 200,
            message : "accepted."
        });
        logger.info("Send data [/api/v1/result res.send(200)]");
    })
    .catch(async (err) => {
        res.status(500).send('Internal Server Error');
        logger.error("/api/v1/result Error"+err);
    });
});

router.post('/api/v1/execution', async function (req, res, next){
    try{
        _Event._api.setExecutionList(req.body)
        .then((data) => {            
            _Event.storage.createExecutionListfile(data);
        })
        .catch(async (err) => {
            res.status(500).send('Internal Server Error:can not syncronize TestEvents');
            logger.error("/api/v1/execution Error, can not syncronize TestEvents:"+err);
        });
        res.status(200).json({
            code : 200,
            message : "accept"
        });
        logger.info("Send data [/api/v1/execution res.send(200)]");
    }catch(err){
        res.status(400).send('Error 400, Can not Syncronize with Support Server');
        logger.error("/api/v1/execution Error 400, Syncronize with Support Server Error :"+err);
        return;
    }
});
module.exports = router;