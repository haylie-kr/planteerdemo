const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const _router = require('../route/router');
const _info_router = require('../route/infos_router');
const logger = require('../lib/logger');
const fs = require('fs');
const _front = require('../lib/frontService');
const CronJOB = require('../lib/registerCronjob');
const cors = require('cors');

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({extended:true, limit: '10mb'}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.get('/execute', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Execute_Trigger_List.html'));
});

app.use('/', _router);
app.use('/', _info_router);
app.use('/', async (req, res)=> {
  const triggers = await _front.getTriggerforFront();
  const details = await _front.getResultforFront();
   res.render('index', { details, triggers });
});
CronJOB.initializeCronjob();
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
(async () => {    
    logger.info("Server is running....");
})();
module.exports = app;