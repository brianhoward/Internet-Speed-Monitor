///////////////
// SETTINGS //
//////////////

// Number of minutes to wait between speed test runs
const speedTestWait = 15;

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
const speedTest = require('speedtest-net');

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

const runSpeedTest = async () => {
	speedTest({maxTime: 5000}).on('data', async data => {
		console.log(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - ${data.speeds.download}mb - ${data.speeds.upload}mb`);
		speedTestData.push({ "time": Date.now(), "download": data.speeds.download, "upload": data.speeds.upload});
		await fs.writeFile('./public/database/speedTestData.json', JSON.stringify(speedTestData));
	});
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
runSpeedTest();
setInterval(runSpeedTest, 1000*60*speedTestWait);

//
//
//

module.exports = app;