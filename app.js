//////////////
// SETTINGS //
//////////////

// Debug flag
const debug = false;
// Number of minutes to wait between speed test runs
const speedTestWait = debug === false ? 15 : 0.5;
// Max days to log
const maxDays = 45;

///////////////
// VARIABLES //
///////////////

let speedTestData = [];
try {
	speedTestData = require('./public/database/speedTestData.json');
} catch {
	speedTestData = [];
}

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
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', (req, res, next) => res.sendFile(`${__dirname}/public/database/speedTestData.json`));
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

///////////////
// FUNCTIONS //
///////////////

const speedTest = async () => {
	try {
		let stdout = '';
		debug === false ?
			({stdout} = await exec('speedtest-cli --simple')) :
			stdout = `Download: ${Math.round(Math.random() * 10000) / 100} Mbit/s\nUpload: ${Math.round(Math.random() * 10000) / 100} Mbit/s\n`;

		const download = stdout.match(/Download: (.*?) Mbit\/s/i)[1];
		const upload = stdout.match(/Upload: (.*?) Mbit\/s/i)[1];
		console.log(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - ${download}mbps - ${upload}mbps`);
		speedTestData.push({time: Date.now(), download: +download, upload: +upload});

		// Trim speedTestData to max days
		let stop = speedTestData.length;
		for(let i = 0; i < stop; i++){
			if(speedTestData[i].time < Date.now() - (maxDays * 24 * 60 * 60 * 1000) ){
				speedTestData.splice(i, 1);
				console.log('Trimmed Data');
				i--;
				stop--;
			}
		}

		await fs.writeFile('./public/database/speedTestData.json', JSON.stringify(speedTestData));
	} catch (err) {
		/not found/gi.test(err) ?
			console.log('SpeedTest-CLI not found. Please install SpeedTest-CLI from https://github.com/sivel/speedtest-cli') :
			console.log(err.stderr);
	}
};

/////////////////////
// INIT SPEED TEST //
/////////////////////

console.log('Starting speed test...\n' +
	'\n' +
	'\n' +
	'----------------------------------------\n' +
	'- Time ------- Download ------- Upload -\n' +
	'----------------------------------------');
speedTest();
setInterval(speedTest, 1000 * 60 * speedTestWait);

////////////////////
// EXPRESS EXPORT //
////////////////////

module.exports = app;