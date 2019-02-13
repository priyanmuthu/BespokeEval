const yargsParser = require('yargs-parser');
const parserConfig = { 'configuration': { 'short-option-groups': false, 'camel-case-expansion': false } };
const constants = require('./constants.js');
const utils = require('./utils.js');
var stringArgv = require("string-argv");

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

        var idx = cObj['_'].indexOf(command);
        if (idx !== -1) cObj['_'].splice(idx, 1);

        //Create YAML supported object
        var cYAMLObj = {};

        cYAMLObj[constants.yamlStrings.commandName] = command;
        cYAMLObj[constants.yamlStrings.rawCommand] = commandStr;

        //Going in the positional order
        cYAMLObj[constants.yamlStrings.parameterArray] = [];

        //Get the argv representation and skip the first one
        var argvArr = stringArgv(commandStr);

        for (var i = 1; i < argvArr.length; i++) {
            var arg = argvArr[i];
            // if the arg is present in positional array, add it to params
            if (cObj['_'].indexOf(arg) > -1) {
                // Positional Argument: add it to the param array
                var pObj = {};
                pObj[constants.yamlStrings.parameterName] = "";
                pObj[constants.yamlStrings.parameterType] = getType(arg);
                pObj[constants.yamlStrings.defaultValue] = arg;
                pObj[constants.yamlStrings.required] = true;
                cYAMLObj[constants.yamlStrings.parameterArray].push(pObj);
                cObj['_'].splice(cObj['_'].indexOf(arg), 1);
            }
            else if (cleanArg(arg) in cObj) {
                // flag in object
                cYAMLObj[constants.yamlStrings.parameterArray].push(getParamObject(arg, cObj[cleanArg(arg)]));
            }
        }
        return cYAMLObj;
    }
    catch (e) {
        console.error(e);
    }
    return null;
}

function cleanArg(arg) {
    if (arg.startsWith('--')) {
        return arg.replace('--', '');
    }
    else if (arg.startsWith('-')) {
        return arg.replace('-', '');
    }
    return arg;
}

function getSynthesis() {
    // get all object keys
    // var fCommand = getFrequentCommand();
    // var filteredObjs = commandObjs.filter(obj => {
    //     return obj[constants.yamlStrings.commandName] === fCommand
    // });
    // console.log(filteredObjs);
    // var allKeys = [];
    // for (var i = 0; i < filteredObjs.length; i++) {
    //     var curKeys = filteredObjs[i][constants.yamlStrings.parameterArray].map(p => p[constants.yamlStrings.parameterName]);
    //     allKeys = [...new Set([...allKeys, ...curKeys])];
    // }
    // console.log(allKeys);

    // for each key synthesize
    var cObj = commandObjs[commandObjs.length - 1];
    return utils.getYAMLText([cObj]); //Always pass command object as array
}

function mergeCommandObjects(commandObjects, command) {
    if (commandObjects.constructor !== Array) { return {}; }
    var mergedDict = {};
    // For each command
    console.log(commandObjects);
    for (var i = 0; i < commandObjects.length; i++) {
        var cObj = commandObjects[i];
        if (cObj[constants.yamlStrings.commandName] !== command) { continue; }
        var paramArr = cObj[constants.yamlStrings.parameterArray];
        for (var j = 0; j < paramArr.length; j++) {
            var param = paramArr[j];
            if (param[constants.yamlStrings.parameterName] === '') {
                // TODO: Handle this later.
                continue;
            }
            var pName = param[constants.yamlStrings.parameterName];
            if (pName in mergedDict) {
                mergedDict[pName].push(param);
            }
            else {
                mergedDict[pName] = [param];
            }
        }
    }

    console.log(mergedDict);

    // Process merged dictionary
    var resDict = {};
    for (var pName in mergedDict) {
        var pArr = mergedDict[pName];
        var typeSet = new Set(pArr.map(p => p[constants.yamlStrings.parameterType]));
        if (typeSet.size === 1) {
            // All of them are of same type, go ahead and make inference
            var pType = [...typeSet][0];
            switch (pType) {
                case constants.yamlTypes.string:
                    //convert to dropdown
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.dropdown;
                    var valArr = pArr.map(p => p[constants.yamlStrings.defaultValue]);
                    valArr = [...new Set(valArr)];
                    newParam[constants.yamlStrings.value] = valArr;
                    resDict[pName] = newParam;
                    break;
                case constants.yamlTypes.file:
                    // File inference
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.file;
                    // TODO: File inferences
                    var re = /(?:\.([^.]+))?$/;
                    var extArr = pArr.map(p => re.exec(p[constants.yamlStrings.defaultValue])[1]);
                    newParam[constants.yamlStrings.extensions] = [...new Set(extArr)];
                    resDict[pName] = newParam;
                    break;
                case constants.yamlTypes.number:
                    // Range of number
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.number;
                    var numArr = pArr.map(p => Number(p[constants.yamlStrings.defaultValue]));
                    newParam[constants.yamlStrings.maxValue] = Math.max.apply(Math, numArr);
                    newParam[constants.yamlStrings.minValue] = Math.min.apply(Math, numArr);
                    resDict[pName] = newParam;
                    break;
                default:
                    // dont do anything. eg: time
            }
        }
        else {
            // All are not the same. Hence either make it a string or dropdown
        }
    }

    return resDict;
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
    pObj[constants.yamlStrings.parameterName] = key;
    pObj[constants.yamlStrings.parameterType] = getType(val);
    pObj[constants.yamlStrings.defaultValue] = val;
    pObj[constants.yamlStrings.required] = true;
    return pObj;
}

function getType(value) {

    // const filePattern = /^(\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{2,})$/;
    const filePattern = /^([.]{0,2}\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{2,})$/;
    const folderPattern = /^([.]{0,2}\/)*([A-z0-9-_+]+\/)+([A-z0-9-_]+)*$/;
    const timerPattern = /^([0-9]{2}:){2}([0-9]{2})$/;
    const numberPattern = /^([0-9]*).?([0-9]+)$/;
    if (filePattern.test(value)) {
        return constants.yamlTypes.file;
    }
    if (folderPattern.test(value)) {
        return constants.yamlTypes.folder;
    }
    if (timerPattern.test(value)) {
        return constants.yamlTypes.time;
    }
    if (numberPattern.test(value)) {
        return constants.yamlTypes.number;
    }
    if (typeof value == typeof true) {
        return constants.yamlTypes.boolean;
    }
    return constants.yamlTypes.string;
}

module.exports.parseArgs = parseArgs;
module.exports.addCommandEntry = addCommandEntry;
module.exports.getSynthesis = getSynthesis;
module.exports.mergeCommandObjects = mergeCommandObjects;
