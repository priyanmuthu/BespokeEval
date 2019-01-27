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

function getYAMLText(YAMLObj){
    return yaml.dump(YAMLObj);
}

module.exports.readFileText = readFileText;
module.exports.getYAMLObject = getYAMLObject;
module.exports.getYAMLText = getYAMLText;