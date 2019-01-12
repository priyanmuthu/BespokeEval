const fs = require('fs')
const path = require('path');
const YAMLPATH = path.join(__dirname, 'example.yaml');

function getYAMLText(){
    console.log('came from constants');
    var yamlText = null;
    try{
        yamlText = fs.readFileSync(YAMLPATH).toString();
    }
    catch(err){
        console.log(err);
    }

    return yamlText;
}