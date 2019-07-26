
console.log('test');

(async () =>{
	try {
		const response = await axios.get('/speedTestData.json');
		console.log(response);
	} catch (error) {
		console.error(error);
	}
})();