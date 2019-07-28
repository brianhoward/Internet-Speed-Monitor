//////////////
// SETTINGS //
//////////////

const updateTime = 15;

///////////////
// VARIABLES //
///////////////

///////////////
// FUNCTIONS //
///////////////

const average = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
const smooth = obj => {
	let smoothObj = [];
	for(let i = 0; i < obj.length; i++){
		if( i === 0 ){
			smoothObj.push({ x: obj[i].x, y: obj[i].y });
		} else if( i === 1 ){
			smoothObj.push({ x: obj[i].x, y: (obj[i -1].y + obj[i].y) / 2 });
		} else {
			smoothObj.push({ x: obj[i].x, y: ( obj[i - 1].y + obj[i - 2].y + obj[i].y ) / 3 });
		}
	}
	return smoothObj;
};

const updatePage = async () => {
	const {data: speedTestData} = await axios.get('/api');
	const time_24h = Date.now() - (24 * 60 * 60 * 1000);
	const time_7d = Date.now() - ((24 * 60 * 60 * 1000) * 7);

	// ToDO: Simplify variables below
	let dl24 = [], ul24 = [], dl7 = [], ul7 = [], dlF = [], ulF = [];

	for (let i = 0; i < speedTestData.length; i++) {
		if (speedTestData[i].time >= time_24h) {
			dl24.push(speedTestData[i].download);
			ul24.push(speedTestData[i].upload);
		}
		if (speedTestData[i].time >= time_7d) {
			dl7.push(speedTestData[i].download);
			ul7.push(speedTestData[i].upload);
		}
		dlF.push(speedTestData[i].download);
		ulF.push(speedTestData[i].upload);
	}

	// ToDo: Simplify below block of code
	document.querySelector('.dl24').innerText = average(dl24);
	document.querySelector('.ul24').innerText = average(ul24);
	document.querySelector('.dl7').innerText = average(dl7);
	document.querySelector('.ul7').innerText = average(ul7);
	document.querySelector('.dlF').innerText = average(dlF);
	document.querySelector('.ulF').innerText = average(ulF);

	new Chart(document.getElementById('chart').getContext('2d'), {
		type: 'line',
		data: {
			datasets: [{
				label: 'Download',
				data: smooth(speedTestData.map(x => { return {x: new Date(x.time), y: x.download}; })),
				fill: false,
				borderColor: '#2196f3'
			}, {
				label: 'Upload',
				data: smooth(speedTestData.map(x => { return {x: new Date(x.time), y: x.upload}; })),
				fill: false,
				borderColor: '#4caf50'
				// pointRadius: 0
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
};

/////////
// RUN //
/////////

updatePage();
setInterval(updatePage, 1000 * 60 * updateTime);