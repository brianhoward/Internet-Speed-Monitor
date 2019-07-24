///////////////
// SETTINGS //
//////////////

// Number of minutes to wait between speed test runs
const speedTestWait = 3;

///////////////
// VARIABLES //
///////////////

try { var speedTestData = require('./public/speedTestData.json'); } catch { var speedTestData = []; }

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
app.use('/api', (req, res, next) => res.sendFile(`${__dirname}/public/speedTestData.json`));
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

///////////////
// FUNCTIONS //
///////////////

const runSpeedTest = async () => {
	speedTest({maxTime: 5000}).on('data', async data => {
		console.log(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - ${data.speeds.download}mb - ${data.speeds.upload}mb`);
		speedTestData.push({ "data": Date.now(), "download": data.speeds.download, "upload": data.speeds.upload});
		await fs.writeFile('./public/speedTestData.json', JSON.stringify(speedTestData));
	});
};

/////////////////////
// INIT SPEED TEST //
/////////////////////

console.log('Starting speed test...');
console.log('');
console.log('');
console.log('----------------------------------------');
console.log('- Date ------- Download ------- Upload -');
console.log('----------------------------------------');
runSpeedTest();
setInterval(runSpeedTest, 1000*60*speedTestWait);

//
//
//

module.exports = app;