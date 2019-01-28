const yargsParser = require('yargs-parser');
const parserConfig = { 'configuration': { 'short-option-groups': false, 'camel-case-expansion': false } };
const constants = require('./constants.js');
const utils = require('./utils.js');

var commandObjs = [];

function addCommandEntry(commandStr) {
    var cObj = parseArgs(commandStr);
    if (cObj != undefined || cObj != null) {
        commandObjs.push(cObj);
    }
}

function parseArgs(commandStr) {
    try {
        var cObj = yargsParser(commandStr, parserConfig);

        var command = commandStr.split(' ')[0];
        console.log(command);

        var idx = cObj['_'].indexOf(command);
        if (idx !== -1) cObj['_'].splice(idx, 1);

        //Create YAML supported object
        var cYAMLObj = {};
        cYAMLObj[constants.yamlStrings.commandName] = command;
        cYAMLObj[constants.yamlStrings.parameterArray] = [];
        for (const key of Object.keys(cObj)) {
            // console.log(key, cObj[key]);
            // Create param obj
            if (key == '_') {
                continue;
            }
            cYAMLObj[constants.yamlStrings.parameterArray].push(getParamObject(key, cObj[key]));
        }
        console.log('_ num values: ' + cObj['_'].length);
        for (var i = 0; i < cObj['_'].length; i++) {
            var pObj = {};
            pObj[constants.yamlStrings.parameterName] = "";
            pObj[constants.yamlStrings.parameterType] = getType(cObj['_'][i]);
            pObj[constants.yamlStrings.defaultValue] = cObj['_'][i];
            pObj[constants.yamlStrings.required] = true;
            cYAMLObj[constants.yamlStrings.parameterArray].push(pObj);
        }
        console.log(cYAMLObj);
        return [cYAMLObj];
    }
    catch (e) {
        console.error(e);
    }
    return null;
}

function getSynthesis() {
    // get all object keys
    // var fCommand = getFrequentCommand();
    // var filteredObjs = commandObjs.filter(obj => {
    //     obj[constants.yamlStrings.commandName] == command
    // });

    // var allKeys = []];
    // for (var i = 0; i < filteredObjs.length; i++) {
    //     allKeys = [...new Set([...allKeys, ...Object.keys(filteredObjs[i])])];
    // }
    // console.log(allKeys);
    var cObj = commandObjs[commandObjs.length - 1];
    return utils.getYAMLText(cObj);
}

function getFrequentCommand() {
    let commands = commandObjs.map(c => c[constants.yamlStrings.commandName]);
    counts = {};
    for (var i = 0; i < commands.length; i++) {
        var k = commands[i];
        counts[k] = counts[k] ? counts[k] + 1 : 1;
    }

    var maxCount = -1;
    var maxCommand = null;
    for (const key of Object.keys(counts)) {
        if (maxCount < counts[key]) {
            maxCommand = key;
            maxCount = counts[key];
        }
    }

    return maxCommand;
}

function getParamObject(key, val) {
    var type = getType(val);
    switch (type) {
        default:
            return getStringParamObject(key, val);
            break;
    }
}

function getStringParamObject(key, val) {
    var pObj = {};
    pObj[constants.yamlStrings.parameterName] = '-' + key;
    pObj[constants.yamlStrings.parameterType] = getType(val);
    pObj[constants.yamlStrings.defaultValue] = val;
    pObj[constants.yamlStrings.required] = true;
    return pObj;
}

function getType(value) {

    const filePattern = /^(\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{3,})$/;
    const timerPattern = /^([0-9]{2}:){2}([0-9]{2})$/;
    if (filePattern.test(value)) {
        return 'file';
    }
    if (timerPattern.test(value)) {
        return 'time';
    }
    return 'string';
}

module.exports.addCommandEntry = addCommandEntry;
module.exports.getSynthesis = getSynthesis;
