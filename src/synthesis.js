const yargsParser = require('yargs-parser');
const parserConfig = { 'configuration': { 'short-option-groups': false, 'camel-case-expansion': false, 'flatten-duplicate-arrays': false } };
const constants = require('./constants.js');
const utils = require('./utils.js');
var stringArgv = require("string-argv");

function parseArgs(commandStr) {
    try {
        var cObj = yargsParser(commandStr, parserConfig);

        var commandName = cObj['_'][0];
        cObj['_'].splice(0, 1);

        //Create YAML supported object
        var cYAMLObj = {};

        cYAMLObj[constants.yamlStrings.commandName] = commandName;
        cYAMLObj[constants.yamlStrings.rawCommand] = commandStr;

        //Going in the positional order
        cYAMLObj[constants.yamlStrings.parameterArray] = [];

        //Get the argv representation and skip the first one
        var argvArr = stringArgv(commandStr);

        for (var i = 1; i < argvArr.length; i++) {
            var arg = argvArr[i];
            // if the arg is present in positional array, add it to params
            if (cObj['_'].indexOf(arg) > -1) {
                if (i == 1) {
                    cYAMLObj[constants.yamlStrings.commandName] = commandName + ' ' + arg;
                    cObj['_'].splice(cObj['_'].indexOf(arg), 1);
                    continue;
                }
                //Redirecting terminal output
                if (constants.terminalOutput.indexOf(arg) > -1 && i + 1 < argvArr.length) {
                    var val = argvArr[i + 1];
                    cYAMLObj[constants.yamlStrings.parameterArray].push(getParamObject(arg, val));
                    cObj['_'].splice(cObj['_'].indexOf(arg), 1);
                    cObj['_'].splice(cObj['_'].indexOf(val), 1);
                    i++;
                    continue;
                }
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
                delete cObj[cleanArg(arg)];
            }
        }
        return cYAMLObj;
    }
    catch (e) {
        console.error(e);
    }
    return null;
}

function parseScript(scriptStr) {
    var commandStrArr = []
    var argArr = stringArgv(scriptStr);

    var currentCommand = "";
    for (var i in argArr) {
        if (argArr[i] === "|") {
            commandStrArr.push(currentCommand);
            currentCommand = "";
            continue;
        }
        var argStr = (argArr[i].includes(' ') || argArr[i].includes('|'))
            ? "\"" + argArr[i] + "\"" : argArr[i];
        currentCommand = currentCommand.concat(' ', argStr);
    }

    if (currentCommand != "") {
        commandStrArr.push(currentCommand);
        currentCommand = "";
    }

    var commandArr = commandStrArr.map(c => parseArgs(c.trim()));

    return commandArr;
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

function mergeScriptObjects(commandObjects, manualObjs, scriptObject) {
    for (var i in scriptObject) {
        var cmdObj = scriptObject[i];
        var cmdName = cmdObj[constants.yamlStrings.commandName];
        if (!(cmdName in commandObjects)) { continue; }
        // There are objects
        var mObj = mergeCommandObjects(commandObjects[cmdName], cmdName);
        var manualParam = manualObjs[cmdName];
        var paramArr = cmdObj[constants.yamlStrings.parameterArray];
        for (var i = 0; i < paramArr.length; i++) {
            var param = paramArr[i];
            var pName = param[constants.yamlStrings.parameterName];
            if(manualParam !== undefined && pName in manualParam){
                var newParam = utils.paramCopy(manualParam[pName]);
                if (constants.yamlStrings.defaultValue in param) {
                    newParam[constants.yamlStrings.defaultValue] = param[constants.yamlStrings.defaultValue];
                }
                paramArr[i] = newParam;
            }
            else if (pName in mObj) {
                var newParam = mObj[pName];
                if (constants.yamlStrings.defaultValue in param) {
                    newParam[constants.yamlStrings.defaultValue] = param[constants.yamlStrings.defaultValue];
                }
                paramArr[i] = newParam;
            }
        }
    }

    // console.log(scriptObject);
    return scriptObject;
}

function mergeCommandObjects(commandObjectsArr, command) {
    if (commandObjectsArr.constructor !== Array) { return {}; }
    var mergedDict = {};
    // For each command
    // if (commandObjectsArr.length <= 1) { return mergedDict; }
    for (var i = 0; i < commandObjectsArr.length; i++) {
        var cObj = commandObjectsArr[i];
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

    // console.log(mergedDict);

    // Process merged dictionary
    var resDict = {};
    for (var pName in mergedDict) {
        // if pname in manual, then don't change
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
                    var extArr = pArr.map(p => utils.getFileExtension(p[constants.yamlStrings.defaultValue]));
                    newParam[constants.yamlStrings.extensions] = [...new Set(extArr)];
                    resDict[pName] = newParam;
                    break;
                case constants.yamlTypes.number:
                    // Range of number
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.number;
                    var numArr = pArr.map(p => Number(p[constants.yamlStrings.defaultValue]));
                    var maxVal = Math.max.apply(Math, numArr);
                    var minVal = Math.min.apply(Math, numArr);
                    if (maxVal !== minVal) {
                        newParam[constants.yamlStrings.maxValue] = maxVal;
                        newParam[constants.yamlStrings.minValue] = minVal;
                    }
                    console.log('herE:', numArr);
                    // For floating point numbers
                    if (numArr.some((n) => {
                        return n % 1 !== 0;
                    })) {
                        var maxPrec = Math.max.apply(Math, numArr.map(n => utils.getPrecision(n)));
                        newParam[constants.yamlStrings.step] = Math.pow(10, -1 * maxPrec);
                    }
                    resDict[pName] = newParam;
                    break;
                case constants.yamlTypes.array:
                    //convert to dropdown
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.array;
                    var valArr = pArr.map(p => p[constants.yamlStrings.defaultValue]);
                    valArr = [...new Set(valArr)];
                    newParam[constants.yamlStrings.value] = valArr;
                    resDict[pName] = newParam;
                    break;
                case constants.yamlTypes.arrayFiles:
                    // File inference
                    var newParam = {};
                    newParam[constants.yamlStrings.parameterName] = pName;
                    newParam[constants.yamlStrings.parameterType] = constants.yamlTypes.arrayFiles;
                    // TODO: File inferences
                    var extArr = pArr.map(p => utils.commaSeparateValues(p[constants.yamlStrings.defaultValue]));
                    extArr = extArr.flat();
                    extArr = extArr.map(e => utils.getFileExtension(e));
                    newParam[constants.yamlStrings.extensions] = [...new Set(extArr)];
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
    var pObj = {};
    pObj[constants.yamlStrings.parameterName] = key;
    pObj[constants.yamlStrings.parameterType] = getType(val);
    pObj[constants.yamlStrings.defaultValue] = val;
    if (val.constructor === Array) {
        pObj[constants.yamlStrings.defaultValue] = val.flat(1).join(', ');
    }
    pObj[constants.yamlStrings.required] = true;
    return pObj;
}

function getType(value) {

    //finding array values
    if (value.constructor === Array) {
        var types = [...new Set(value.map(v => getType(v)))];
        if (types.length == 1 && types[0] === constants.yamlTypes.file) {
            return constants.yamlTypes.arrayFiles;
        }
        return constants.yamlTypes.array;
    }

    // const filePattern = /^(\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{2,})$/;
    const filePattern = /^([.]{0,2}\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{2,})$/;
    const folderPattern = /^([.]{0,2}\/)*([A-z0-9-_+]+\/)+([A-z0-9-_]+)*$/;
    const timerPattern = /^([0-9]{2}:){2}([0-9]{2})$/;
    const numberPattern = /^([0-9]*).?([0-9]+)$/;
    if (numberPattern.test(value)) {
        return constants.yamlTypes.number;
    }
    if (filePattern.test(value)) {
        return constants.yamlTypes.file;
    }
    if (folderPattern.test(value)) {
        return constants.yamlTypes.folder;
    }
    if (timerPattern.test(value)) {
        return constants.yamlTypes.time;
    }
    if (typeof value == typeof true) {
        return constants.yamlTypes.boolean;
    }
    return constants.yamlTypes.string;
}

module.exports.parseArgs = parseArgs;
module.exports.mergeCommandObjects = mergeCommandObjects;
module.exports.parseScript = parseScript;
module.exports.mergeScriptObjects = mergeScriptObjects;