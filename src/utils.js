const fs = require('fs')
const path = require('path');
const yaml = require('js-yaml');
function readFileText(path) {
    var yamlText = null;
    try {
        yamlText = fs.readFileSync(path).toString();
    }
    catch (err) {
        console.log(err);
    }

    return yamlText;
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

module.exports.readFileText = readFileText;
module.exports.getYAMLObject = getYAMLObject;
module.exports.getYAMLText = getYAMLText;
module.exports.getFileExtension = getFileExtension;
module.exports.checkIfFilePath = checkIfFilePath;