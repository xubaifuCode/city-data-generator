/**
 * 根据省市数据生成sql文件和联动组件需要的JSON数据
 * cityData.sql 生成的sql语句
 * cityData.json 组件所需数据
 */
const fs = require('fs');
const {
  fetchDataAsync
} = require('./fetchData');
const processData = require('./processData');



const outputFile = (jsonText, sqlText) => {
  const basePath = './dist/';
  const fileName = 'cityData';
  const fullPath = `${basePath}/${fileName}`;
  const citySqlFile = `${fullPath}.sql`;
  const cityJSONFile = `${fullPath}.json`;
  fs.writeFileSync(citySqlFile, sqlText);
  fs.writeFileSync(cityJSONFile, jsonText);
};


const start = () => {
  fetchDataAsync().then(({
    rawProvinceData,
    rawCityData
  }) => {
    const {
      jsonText,
      sqlText
    } = processData(rawProvinceData, rawCityData);
    outputFile(jsonText, sqlText);
  });
};

start();