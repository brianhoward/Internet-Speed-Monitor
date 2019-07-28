//////////////
// SETTINGS //
//////////////

const updateTime = 15;
const smoothing = 2;
// const debug = false;

///////////////
// VARIABLES //
///////////////

///////////////
// FUNCTIONS //
///////////////

const average = arr => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
const sumRange = (obj, point, range) => {
	let sum = 0;
	for(let i = 0; i < range; i++) sum += obj[point - i].y;
	return sum;
};
const smooth = obj => {
	let smoothObj = [];
	for(let i = 0; i < obj.length; i++){
		i < smoothing ?
			smoothObj.push({ x: obj[i].x, y: ( sumRange(obj, i, i+1)  / (i+1)).toFixed(1) }) :
			smoothObj.push({ x: obj[i].x, y: ( sumRange(obj, i, smoothing+1)  / (smoothing+1)).toFixed(1) });
	}
	return smoothObj;
};
const updatePage = async () => {
	const {data: speedTestData} = await axios.get('/api');
	const time24 = Date.now() - (24 * 60 * 60 * 1000);
	const time7 = Date.now() - ((24 * 60 * 60 * 1000) * 7);

	let speedTime = {};
	for (let i = 0; i < speedTestData.length; i++) {
		if (speedTestData[i].time >= time24) {
			!speedTime.dl24 ? speedTime.dl24=[speedTestData[i].download] : speedTime.dl24=[...speedTime.dl24, speedTestData[i].download];
			!speedTime.ul24 ? speedTime.ul24=[speedTestData[i].upload] : speedTime.ul24=[...speedTime.ul24, speedTestData[i].upload];
		}
		if (speedTestData[i].time >= time7) {
			!speedTime.dl7 ? speedTime.dl7=[speedTestData[i].download] : speedTime.dl7=[...speedTime.dl7, speedTestData[i].download];
			!speedTime.ul7 ? speedTime.ul7=[speedTestData[i].upload] : speedTime.ul7=[...speedTime.ul7, speedTestData[i].upload];
		}
		!speedTime.dlF ? speedTime.dlF=[speedTestData[i].download] : speedTime.dlF=[...speedTime.dlF, speedTestData[i].download];
		!speedTime.ulF ? speedTime.ulF=[speedTestData[i].upload] : speedTime.ulF=[...speedTime.ulF, speedTestData[i].upload];
	}

	for(let key of Object.keys(speedTime)) document.querySelector(`.${key}`).innerText = average(speedTime[key]);

	new Chart(document.getElementById('chart').getContext('2d'), {
		type: 'line',
		data: {
			datasets: [{
				label: 'Download',
				data: smooth(speedTestData.map(x => { return {x: new Date(x.time), y: x.download}; })),
				fill: false,
				borderColor: '#2196f3',
				pointRadius: 0
			}, {
				label: 'Upload',
				data: smooth(speedTestData.map(x => { return {x: new Date(x.time), y: x.upload}; })),
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
							fontStyle: 'bold'
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