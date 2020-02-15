const express = require('express');
const bespokeSyncServer = require('./syncserver/');
const fileUpload = require('express-fileupload');
const basicAuth = require('express-basic-auth');
const config = require('./config.js');

const globby = require('globby');
const rimraf = require('rimraf');
const convert = require('./convert.js');

const app = express();

const maxServerCount = 10;
const slideServers = {};

app.set('view engine', 'ejs');

app.use('/slides', express.static(__dirname + '/slides'));

app.use('/sync/:slideId', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    const { slideId } = req.params;
    if(!(slideId in slideServers)) {
        if(Object.keys(slideServers).length >= maxServerCount) {
            const todel = Object.keys(slideServers)[0];
            delete slideServers[todel];
            console.log('Old slideServer deleted:', todel);
        }
        slideServers[slideId] = bespokeSyncServer();
        console.log('New slideServer created:', slideId);
    }
    slideServers[slideId](req, res, next);
})

app.use(basicAuth({
    users: config.auth,
    challenge: true,
}));

app.get('/', async (req, res) => {
    const filelist = (await globby('slides/*.md')).map(s => s.slice(7, -3));
    res.render('slidelist', {filelist});
});

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.post('/upload', async (req, res) => {
    const filename = req.files.file.name;
    if(filename.slice(-3) != '.md') {
        res.send('Bad file.');
        return;
    }
    req.files.file.mv(__dirname + '/slides/' + filename);
    console.log('begin converting file', filename);
    await convert(filename);
    res.redirect('/');
})

app.get('/del/:filename([^\/]*)', (req, res) => {
    rimraf(`${__dirname}/slides/${req.params.filename}.*`, err => {
        if(err) res.send(err.toString());
        else res.redirect('/');
    })
})

process.on('SIGINT', function() {
    process.exit(1);
});

app.listen(config.port, config.host);
