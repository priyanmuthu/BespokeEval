const fs = require('fs')
const path = require('path');
function readFileText(path){
    console.log('from utils');
    var yamlText = null;
    try{
        yamlText = fs.readFileSync(path).toString();
    }
    catch(err){
        console.log(err);
    }

    return yamlText;
}

function getYAMLObject(text){
    return yaml.load(text);
}

module.exports.readFileText = readFileText;
module.exports.getYAMLObject = getYAMLObject;