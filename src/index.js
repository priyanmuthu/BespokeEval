const fs = require('fs')
const path = require('path');
const yaml = require('js-yaml')
const YAMLPATH = path.join(__dirname, 'example.yaml');
var formDiv;
$(document).ready(() => {
    // Do everything here
    formDiv = document.getElementById('formDiv');
    renderUI();
})

function getYAMLText(){
    var yamlText = null;
    try{
        yamlText = fs.readFileSync(YAMLPATH).toString();
    }
    catch(err){
        console.log(err);
    }

    return yamlText;
}

function getYAMLObject(){
    return yaml.load(getYAMLText());
}

function renderUI(){
    formDiv.innerHTML = "";
    formDiv.appendChild(createUI(getYAMLObject()));
}

function createUI(yamlObj){
    var mainDiv = document.createElement("div");
    mainDiv.id = 'mainDiv'
    //Do this for the command
    var command = yamlObj['command'];
    
    //Create a text for command
    var commandDiv = document.createElement("div");
    commandDiv.id = 'commandDiv';
    mainDiv.appendChild(commandDiv);

    commandHeading = document.createElement('h3');
    commandHeading.innerHTML = commandHeading.innerHTML + "<b>Command:</b   s> ffmpeg";
    console.log('<bold>Command:<bold> '.concat( command['name']));
    commandDiv.appendChild(commandHeading);

    var mainParamDiv = document.createElement('div');
    mainParamDiv.id = 'mainParamDiv';

    renderParamUI(mainParamDiv, command['params']);
    commandDiv.appendChild(mainParamDiv);
    console.log(command['params']);

    return mainDiv;
}

function renderParamUI(mainParamDiv, params){
    var paramCount = params.length;
    for(var i = 0; i < paramCount; i++){
        param = params[i];
        //Render the param UI
        var pDiv = document.createElement('div')
        pDiv.id = 'param_div_' + i;
        
        var paramName = document.createElement('p');
        paramName.innerHTML = param['parameter']
        pDiv.appendChild(paramName);

        var paramEdit = document.createElement('input');
        paramEdit.type = 'text';
        paramEdit.id = 'input_param_1';
        param.innerHTML = param['default'];

        pDiv.appendChild(paramEdit);

        mainParamDiv.appendChild(pDiv);
    }
}