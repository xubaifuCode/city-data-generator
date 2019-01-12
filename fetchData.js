const fs = require('fs');
const https = require('https');

const getJSONByUrl = url => {
    console.log(`开始下载: ${url}`);
    return new Promise(resolve => {
        let size = 0;
        let chunks = [];
        https.get(url, (res) => {
            res.on('data', (chunk) => {
                size += chunk.length;
                chunks.push(chunk);
            });
            res.on('end', () => {
                const data = Buffer.concat(chunks, size);
                console.log(`下载完成, size:${size}`);
                resolve(data.toString());
            });
        }).on('error', (e) => {
            console.error(e);
            resolve([]);
        });
    });
};

const fetchDataByNetwork = (async () => {
    const provinceUrl = 'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/provinces.json';
    const cityUrl = 'https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/cities.json';

    const rawProvinceData = await getJSONByUrl(provinceUrl);
    const rawCityData = await getJSONByUrl(cityUrl);

    return {
        rawProvinceData: JSON.parse(rawProvinceData),
        rawCityData: JSON.parse(rawCityData)
    };
});
const fetchDataByLocal = () => {
    const provinceJSON = './province.json';
    const cityJSON = './city.json';
    const rawProvinceData = JSON.parse(fs.readFileSync(provinceJSON));
    const rawCityData = JSON.parse(fs.readFileSync(cityJSON));
    return {
        rawProvinceData,
        rawCityData
    };
};

module.exports = {
    fetchData: fetchDataByLocal,
    fetchDataAsync: fetchDataByNetwork
};