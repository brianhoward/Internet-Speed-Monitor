//////////////
// SETTINGS //
//////////////

const updateTime = 15;

///////////////
// VARIABLES //
///////////////

let averages = {
	'24h': {
		upload: null,
		download: null
	},
	'7d': {
		upload: null,
		download: null
	},
	'full': {
		upload: null,
		download: null
	},
	update(speedTestData) {
		const time_24h = Date.now() - ((24 * 60 * 60 * 1000) * 1);
		const time_7d = Date.now() - ((24 * 60 * 60 * 1000) * 7);

		let temp_download_24h = [];
		let temp_upload_24h = [];
		let temp_download_7d = [];
		let temp_upload_7d = [];
		let temp_download_full = [];
		let temp_upload_full = [];

		for (let i = 0; i < speedTestData.length; i++) {
			if (speedTestData[i].time >= time_24h) {
				temp_download_24h.push(speedTestData[i].download);
				temp_upload_24h.push(speedTestData[i].upload);
			}
			if (speedTestData[i].time >= time_7d) {
				temp_download_7d.push(speedTestData[i].download);
				temp_upload_7d.push(speedTestData[i].upload);
			}
			temp_download_full.push(speedTestData[i].download);
			temp_upload_full.push(speedTestData[i].upload);
		}

		const average = input => input.reduce((a, b) => a + b, 0) / input.length;
		this['24h'].download = average(temp_download_24h);
		this['24h'].upload = average(temp_upload_24h);
		this['7d'].download = average(temp_download_7d);
		this['7d'].upload = average(temp_upload_7d);
		this['full'].download = average(temp_download_full);
		this['full'].upload = average(temp_upload_full);

		document.querySelector('.download_24h').innerText = this['24h'].download.toFixed(1);
		document.querySelector('.upload_24h').innerText = this['24h'].upload.toFixed(1);
		document.querySelector('.download_7d').innerText = this['7d'].download.toFixed(1);
		document.querySelector('.upload_7d').innerText = this['7d'].upload.toFixed(1);
		document.querySelector('.download_full').innerText = this['full'].download.toFixed(1);
		document.querySelector('.upload_full').innerText = this['full'].upload.toFixed(1);

	}
};

///////////////
// FUNCTIONS //
///////////////

const updateAvrages = (speedTestData) => {

};

/////////
// RUN //
/////////

(async () => {

	let speedTestData = [];

	try {
		const response = await axios.get('/speedTestData.json');
		speedTestData = response.data;
	} catch (err) {
		console.error(err);
	}

	averages.update(speedTestData);

	new Chart(document.getElementById('chart').getContext('2d'), {
		type: 'line',
		data: {
			datasets: [{
				label: 'Download',
				data: speedTestData.map(x => { return {x: new Date(x.time), y: x.download} }),
				fill: false,
				borderColor: '#2196f3'
			},{
				label: 'Upload',
				data: speedTestData.map(x => { return {x: new Date(x.time), y: x.upload} }),
				fill: false,
				borderColor: '#4caf50',
				pointRadius: 0
			}]
		},
		'options': {
			responsive: true,
			maintainAspectRatio: false,
			title: {
				display: false,
				text: ''
			},
			tooltips: {
				mode: 'index'
			},
			scales: {
				xAxes: [{
					type: 'time',
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Date'
					},
					ticks: {
						major: {
							fontStyle: 'bold',
							fontColor: '#FF0000'
						}
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: 'Speed (Mbps)'
					}
				}]
			}
		}
	});

})();