const reportHandler = require('./dataHandler');
const dataSendHandler = require('./dataSendHandler');
const config = JSON.parse(require('fs').readFileSync('./config/environment.json'));
const storage = require('./connectFiles');
const dataUpdateHandler = require('./dataCommentHandler');
const _api = require('./setApiHandler');
const getSession = require('./getSession');
const imageUploader = require('./imageHandler');
const executeCollector = require('./executeCollector');
const seperator = "@";
const resultEvent = require('./watchEventHandler');
const resultHandler = require('./resultHandler');
const executeHandler = require('./executeHandler');
const getReports = require('./pdfHandler');
const setCronjob = require('./setCronjob');
const Cronjob = require('./registerCronjob');
module.exports = {reportHandler, dataSendHandler, config, storage, dataUpdateHandler,executeHandler,setCronjob,Cronjob,
     _api, getSession, imageUploader, executeCollector,seperator,resultEvent,resultHandler, getReports};