///////////////
// SETTINGS //
//////////////

// Debug
const debug = false;
// Number of minutes to wait between speed test runs
const speedTestWait = debug === false ? 15 : 0.5;

///////////////
// VARIABLES //
///////////////

let speedTestData = [];
try { speedTestData = require('./public/database/speedTestData.json'); } catch { speedTestData = [] }

////////////////////////
// IMPORTS & REQUIRES //
////////////////////////

const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/////////////
// EXPRESS //
/////////////

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (req, res, next) => res.sendFile(`${__dirname}/public/database/speedTestData.json`));
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

///////////////
// FUNCTIONS //
///////////////

const speedTest = async () => {
	try{
		let stdout = '';
		if( debug === false ){
			({ stdout } = await exec("speedtest-cli --simple"));
		} else {
			stdout = `Download: ${Math.round(Math.random()*10000)/100} Mbit/s\nUpload: ${Math.round(Math.random() * 10000) / 100} Mbit/s\n`
		}

		const download = stdout.match(/Download: (.*?) Mbit\/s/i)[1];
		const upload = stdout.match(/Upload: (.*?) Mbit\/s/i)[1];
		console.log(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - ${download}mbps - ${upload}mbps`);
		speedTestData.push({ "time": Date.now(), "download": +download, "upload": +upload});
		await fs.writeFile('./public/database/speedTestData.json', JSON.stringify(speedTestData));
	} catch (err) {
		/not found/gi.test(err) ? console.log('SpeedTest-CLI not found. Please install SpeedTest-CLI from https://github.com/sivel/speedtest-cli') : console.log(err.stderr);
	}
};

/////////////////////
// INIT SPEED TEST //
/////////////////////

console.log('Starting speed test...');
console.log('');
console.log('');
console.log('----------------------------------------');
console.log('- Time ------- Download ------- Upload -');
console.log('----------------------------------------');
speedTest();
setInterval(speedTest, 1000*60*speedTestWait);

////////////////////
// EXPRESS EXPORT //
////////////////////

module.exports = app;