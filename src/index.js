const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const renderer = require('./renderer.js');
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const utils = require('./utils.js')
var formDiv;
$(document).ready(() => {
    // Do everything here
    formDiv = document.getElementById('formDiv');
    // renderUI();
})

function renderUI(){
    var editorText = window.editor.getValue();
    try{
        var newUI = createUI(utils.getYAMLObject(editorText));
        formDiv.innerHTML = "";
        formDiv.appendChild(newUI);
        $('[data-toggle="tooltip"]').tooltip();

        // var command = yamlObj['command'];
        // var params = command['params'];
        // var val = params[2]['eval']();
        // console.log('val: '+val);
    }
    catch(e){
        //Show an error UI
    }
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
    commandDiv.appendChild(commandHeading);

    var mainParamDiv = document.createElement('div');
    mainParamDiv.id = 'mainParamDiv';
    mainParamDiv.classList.add('grid-form')

    renderParamUI(mainParamDiv, command['params']);
    commandDiv.appendChild(mainParamDiv);

    return mainDiv;
}

function renderParamUI(mainParamDiv, params){
    var paramCount = params.length;
    for(var i = 0; i < paramCount; i++){
        param = params[i];
        // //Render the param UI
        // var pDiv = document.createElement('div')
        // pDiv.id = 'param_div_' + i;
        
        // var paramName = document.createElement('label');
        // paramName.innerHTML = param['parameter']
        // pDiv.appendChild(paramName);

        // var paramEdit = document.createElement('input');
        // paramEdit.classList.add('form-control');
        // paramEdit.type = 'text';
        // paramEdit.id = 'input_param_1';
        // param.innerHTML = param['default'];

        // pDiv.appendChild(paramEdit);

        var pDiv;

        switch(param['type']){
            case 'time':
                pDiv = renderer.renderTimeParam(param);
                break;
            case 'boolean':
                pDiv = renderer.renderBooleanParam(param);
                break;
            default:
                pDiv = renderer.renderStringParam(param);
                break;
        }

        mainParamDiv.appendChild(pDiv);
    }
}