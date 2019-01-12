/**
 * 根据城市的provinceCode分组，生成数据格式为:{'省级代码':{label:'市级名称',value:'市级代码'}}
 * @param {Array} rawCityData 
 */
const groupCityByProvince = (rawCityData) => {
    return rawCityData.reduce((acc, cur) => {
        if (!acc[cur.provinceCode]) acc[cur.provinceCode] = [];
        if (cur.name.indexOf('行政区划') === -1) {
            acc[cur.provinceCode].push({
                // 删除前2位省级代码
                value: cur.code.substring(2),
                label: cur.name
            });
        }
        return acc;
    }, {});
};

const createIndexForProvinceCodeToName = (rawProvinceData) => {
    return rawProvinceData.reduce((acc, cur) => {
        acc[cur.code] = cur.name;
        return acc;
    }, {});
};

/**
 * 生成符合elementUI cascader级联选择器的省市联动数据
 * 参考： http://element-cn.eleme.io/#/zh-CN/component/cascader 
 * @param {Array} rawProvinceData 
 * @param {Array} rawCityData 
 */
const generateFormattedData = (rawProvinceData, rawCityData) => {
    // 根据省代码创建索引
    const provinceCodeToNameIndex = createIndexForProvinceCodeToName(rawProvinceData);
    const groupedData = groupCityByProvince(rawCityData);
    return Object.keys(groupedData).reduce((acc, cur) => {
        // 针对直辖市的过滤，将多余节点过滤，生成只有一个以该市命名的子节点
        if (groupedData[cur].length <= 2) {
            groupedData[cur][0].label = provinceCodeToNameIndex[cur];
            groupedData[cur] = [groupedData[cur][0]];
        }
        acc.push({
            label: provinceCodeToNameIndex[cur],
            value: cur,
            children: groupedData[cur]
        });
        return acc;
    }, []);
};

/**
 * 生成插入数据库的SQL语句
 * 数据库表为 id parent_id, name 分别对应
 */
const generateSqlText = (formattedData, tableName = 'area_code') => {
    const sqlArray = formattedData.reduce((acc, cur) => {
        // 省
        let sql = `INSERT INTO ${tableName} VALUES('${cur.value}','00','${cur.label}');`;
        acc.push(sql);

        // 市
        return acc.concat(cur.children.map(child => (`INSERT INTO ${tableName} VALUES('${child.value}','${cur.value}','${child.label}');`)));
    }, []);

    return JSON.stringify(sqlArray.join('')).replace(/"/g, '');
};

const processData = (rawProvinceData, rawCityData) => {
    const formattedData = generateFormattedData(rawProvinceData, rawCityData);
    const jsonText = JSON.stringify(formattedData);
    const sqlText = generateSqlText(formattedData);
    return {
        formattedData,
        jsonText,
        sqlText
    };
};

module.exports = processData;