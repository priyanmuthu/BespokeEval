const fs = require('fs')
const path = require('path');
const yaml = require('js-yaml');
const uuid = require('uuid/v4');
const constants = require('./constants.js');
function readFileText(filePath) {
    let fileText = null;
    let fullPath = path.resolve(filePath);
    console.log(fullPath);
    try {
        fileText = fs.readFileSync(fullPath).toString();
    }
    catch (err) {
        console.log(err);
    }

    return fileText;
}

function writeTextToFile(filePath, fileText) {
    fs.writeFileSync(filePath, fileText);
}

function getYAMLObject(text) {
    return yaml.load(text);
}

function getYAMLText(YAMLObj) {
    return yaml.dump(YAMLObj);
}

function checkIfFilePath(filepath) {
    const filePattern = /^([.]{0,2}\/)*([A-z0-9-_+]+\/)*([A-z0-9-_]+\.[a-zA-Z0-9]{2,})$/;
    if (filePattern.test(filepath)) {
        return true;
    }
    return false;
}

function getFileExtension(filepath) {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(filepath)[1];
}

function getPrecision(num) {
    var numAsStr = num.toFixed(10); //number can be presented in exponential format, avoid it
    numAsStr = numAsStr.replace(/0+$/g, '');

    var precision = String(numAsStr).replace('.', '').length - num.toFixed().length;
    return precision;
}

function commaSeparateValues(valueArrStr) {
    return valueArrStr.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
}

function RunCommandAsProcess(commandString, callback) {
    const { exec } = require('child_process');
    exec(commandString, (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            callback('');
        }

        // the *entire* stdout and stderr (buffered)
        callback(stdout);
    });
}

function RunCommandAsProcessSync(commandString, callback) {
    const { execSync } = require('child_process');
    return execSync(commandString).toString();
}

async function RunCommandAsProcessAsync(commandString) {
    const { exec } = require('promisify-child-process')
    const { stdout, stderr } = await exec(commandString);
    return stdout;
}

function ExtractManPageInfo(commandString) {
    let result = {};
    try {
        const cheerio = require("cheerio");
        const htmlToText = require("html-to-text");
        var cmd = `curl -Gs "https://explainshell.com/explain?"$ --data-urlencode 'cmd=${commandString}'`;
        console.log(cmd);
        let resultHtml = RunCommandAsProcessSync(cmd);
        // let resultHtml = readFileText('manpage.html');
        // console.log(resultHtml);
        let dollar = cheerio.load(resultHtml);
        dollar('pre').each((i, ele) => {
            console.log(ele);
        });

        // For tracking parameters
        let paramHelpRef = {};
        dollar('.command0').each((i, ele) => {
            let param = htmlToText.fromString(dollar.html(ele)).split(' ')[0];
            paramHelpRef[param] = dollar(ele).attr('helpref');
        });

        // Tracking Explain text
        let explains = {};
        dollar('pre').each((i, ele) => {
            let id = dollar(ele).attr('id');
            let explainText = htmlToText.fromString(dollar.html(ele));
            explains[id] = explainText;
        });


        for (var p in paramHelpRef) {
            if (paramHelpRef[p] === undefined) { continue; }
            result[p] = explains[paramHelpRef[p]];
        }

        console.log(result);
    }
    catch(e){
        console.error(e);
    }
    return result
}


function getUniqueID() {
    return uuid().replace(/-/g, "");
}

function paramCopy(paramObj, filter = []) {
    newParam = {};
    var copyExclude = ["isinclude",
        "evaluate"];
    for (key in constants.yamlStrings) {
        if (copyExclude.includes(key)) { continue; }
        if (filter.includes(key)) { continue; }
        if (!(constants.yamlStrings[key] in paramObj)) { continue; }
        newParam[constants.yamlStrings[key]] = paramObj[constants.yamlStrings[key]];
    }
    return newParam;
}

module.exports.onChange = (object, onChange) => {
    const handler = {
        get(target, property, receiver) {
            try {
                return new Proxy(target[property], handler);
            } catch (err) {
                return Reflect.get(target, property, receiver);
            }
        },
        defineProperty(target, property, descriptor) {
            onChange();
            return Reflect.defineProperty(target, property, descriptor);
        },
        deleteProperty(target, property) {
            onChange();
            return Reflect.deleteProperty(target, property);
        }
    };

    return new Proxy(object, handler);
};

module.exports.readFileText = readFileText;
module.exports.getYAMLObject = getYAMLObject;
module.exports.getYAMLText = getYAMLText;
module.exports.getFileExtension = getFileExtension;
module.exports.checkIfFilePath = checkIfFilePath;
module.exports.getPrecision = getPrecision;
module.exports.writeTextToFile = writeTextToFile;
module.exports.commaSeparateValues = commaSeparateValues;
module.exports.RunCommandAsProcess = RunCommandAsProcess;
module.exports.getUniqueID = getUniqueID;
module.exports.paramCopy = paramCopy;
module.exports.RunCommandAsProcessAsync = RunCommandAsProcessAsync;
module.exports.RunCommandAsProcessSync = RunCommandAsProcessSync;
module.exports.ExtractManPageInfo = ExtractManPageInfo;