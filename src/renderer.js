//Place all the constants here
let stringCount = 0;
let timeCount = 0;
let booleanCount = 0;
let markdownCount = 0;
let dropdownCount = 0;
let fileDialogCount = 0;

const utils = require('./utils.js');
const constants = require('./constants.js');
// Using Showdown.js to parse markdown to HTML: https://github.com/showdownjs/showdown
const showdown = require('showdown');
let mdConverter = new showdown.Converter();
const Awesomplete = require('awesomplete');
const { dialog } = require('electron').remote;
const path = require('path');

function renderUI() {
    var editorText = window.editor.getValue();
    try {
        var formDiv = document.getElementById('formDiv');
        var yamlObj = utils.getYAMLObject(editorText);
        var newUI = createUI(yamlObj);
        formDiv.innerHTML = "";
        formDiv.appendChild(newUI);
        $('[data-toggle="tooltip"]').tooltip();
        module.exports.yamlObj = yamlObj;

        // var command = yamlObj['command'];
        // var params = command['params'];
        // var val = params[2]['eval']();
        // console.log('val: '+val);
    }
    catch (e) {
        //Show an error UI
        console.log(e);
    }
}

function createUI(yamlObj) {
    var mainDiv = document.createElement("div");
    mainDiv.id = 'mainDiv';

    //Do this for the command
    var commandCount = yamlObj.length;
    for (var i = 0; i < commandCount; i++) {
        command = yamlObj[i];
        var commandDiv = renderCommandUI(command, i);
        mainDiv.appendChild(commandDiv);
    }
    return mainDiv;
}

function renderCommandUI(command, div_ID) {
    //Create a text for command
    var commandDiv = document.createElement("div");
    commandDiv.id = 'commandDiv_' + div_ID;

    commandHeading = document.createElement('h1');
    commandHeading.innerHTML = commandHeading.innerHTML + "<b>Command:</b> " + command[constants.yamlStrings.commandName];
    var runButton = document.createElement('button');
    runButton.classList.add('btn');
    runButton.classList.add('btn-primary');
    runButton.classList.add('pull-right');
    runButton.innerText = "Run";
    runButton.style.minWidth = "40px";
    runButton.insertAdjacentHTML('beforeend', '<span class="glyphicon glyphicon-play" style="margin-left:5px;" />');
    runButton.addEventListener("click", () => {
        runCommand(command);
    });
    commandHeading.appendChild(runButton);
    commandDiv.appendChild(commandHeading);

    var mainParamDiv = document.createElement('div');
    mainParamDiv.id = 'mainParamDiv';
    mainParamDiv.classList.add('grid-form')

    renderParamUI(mainParamDiv, command[constants.yamlStrings.parameterArray]);
    commandDiv.appendChild(mainParamDiv);
    return commandDiv;
}

function renderParamUI(mainParamDiv, params) {
    var paramCount = params.length;
    for (var i = 0; i < paramCount; i++) {
        param = params[i];

        var pDiv;

        switch (param[constants.yamlStrings.parameterType]) {
            case constants.yamlTypes.time:
                pDiv = renderTimeParam(param);
                break;
            case constants.yamlTypes.boolean:
                pDiv = renderBooleanParam(param);
                break;
            case constants.yamlTypes.markdown:
                pDiv = renderMarkdownParam(param);
                break;
            case constants.yamlTypes.dropdown:
                pDiv = renderDropdownParam(param);
                break;
            case constants.yamlTypes.file:
                pDiv = renderFileDialog(param);
                break;
            default:
                pDiv = renderStringParam(param);
                break;
        }

        //adding border to pdiv
        pDiv.style.background = '#303030';
        pDiv.style.padding = '10px'
        pDiv.style.borderRadius = '10px'

        //add a checkbox for selection
        if (param[constants.yamlStrings.parameterType] == constants.yamlTypes.boolean) {
            // No need for a checkbox
            mainParamDiv.appendChild(pDiv);
        }
        else {
            // add a checkbox
            mainParamDiv.appendChild(pDiv);
        }

        // mainParamDiv.appendChild(pDiv);
    }
}

function renderStringParam(param) {
    //Render the param UI
    var pDiv = document.createElement('div')
    pDiv.id = 'param_string_' + stringCount;
    stringCount = stringCount + 1;
    pDiv.classList.add('form-group');

    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }
    var paramcheck = document.createElement('input');
    paramcheck.type = 'checkbox'
    paramcheck.checked = true;
    paramcheck.classList.add('pull-right');
    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(paramcheck);
    pDiv.appendChild(paramName);

    var paramEdit = document.createElement('input');
    paramEdit.classList.add('form-control');
    paramEdit.type = 'text';
    paramEdit.id = 'input_param_' + stringCount;
    if (constants.yamlStrings.defaultValue in param) {
        paramEdit.value = param[constants.yamlStrings.defaultValue];
    }
    paramEdit.placeholder = param[constants.yamlStrings.parameterName];
    pDiv.appendChild(paramEdit);

    param[constants.yamlStrings.evaluate] = function () {
        var valStr = paramEdit.value;

        return (valStr.includes(' '))? '"' + valStr + '"' : valStr;
    }
    
    param[constants.yamlStrings.isinclude] = function () {
        return paramcheck.checked;
    }

    return pDiv;
}

function renderMarkdownParam(param) {
    var pDiv = document.createElement('div')
    pDiv.id = 'param_md_' + markdownCount;
    pDiv.style['grid-column'] = "1/-1";
    markdownCount = markdownCount + 1;

    // pDiv.insertAdjacentHTML('beforeend', '<br />');
    pDiv.insertAdjacentHTML('beforeend', mdConverter.makeHtml(param[constants.yamlStrings.markdownValue]));

    return pDiv;
}

function renderTimeParam(param) {
    //Render the param UI
    var pDiv = document.createElement('div')
    pDiv.id = 'param_time_' + timeCount;
    timeCount = timeCount + 1;
    pDiv.classList.add('form-group');

    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }
    var paramcheck = document.createElement('input');
    paramcheck.type = 'checkbox'
    paramcheck.checked = true;
    paramcheck.classList.add('pull-right');
    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(paramcheck);
    pDiv.appendChild(paramName);
    pDiv.insertAdjacentHTML('beforeend', '<br/>');

    var defaultVal = null;
    if (constants.yamlStrings.defaultValue in param) {
        defaultVal = param[constants.yamlStrings.defaultValue];
    }
    var result = createTimerInput('timer_input_' + stringCount, defaultVal);
    var paramEdit = result['div'];
    pDiv.appendChild(paramEdit);

    param[constants.yamlStrings.evaluate] = result[constants.yamlStrings.evaluate];

    param[constants.yamlStrings.isinclude] = function () {
        return paramcheck.checked;
    }

    return pDiv;
}

function renderBooleanParam(param) {
    //Render the param UI
    var pDiv = document.createElement('div')
    pDiv.id = 'param_bool_' + booleanCount;
    booleanCount = booleanCount + 1;
    pDiv.classList.add('form-group');
    pDiv.insertAdjacentHTML('beforeend', '<br/>');

    var paramEdit = document.createElement('input');
    paramEdit.classList.add('form-check-input');
    paramEdit.type = 'checkbox';
    paramEdit.id = 'input_param_' + stringCount;
    if (constants.yamlStrings.defaultValue in param) {
        paramEdit.checked = param[constants.yamlStrings.defaultValue];
    }
    pDiv.appendChild(paramEdit);

    var paramName = document.createElement('label');
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }
    paramName.innerHTML = param[constants.yamlStrings.parameterName]
    paramName.style.marginLeft = "10px";
    paramName.style.fontSize = "16px";
    pDiv.appendChild(paramName);

    param[constants.yamlStrings.evaluate] = function () {
        return paramEdit.checked;
    }

    param[constants.yamlStrings.isinclude] = function () {
        return true;
    }

    return pDiv;
}

function renderDropdownParam(param) {
    //Render the param UI

    var pDiv = document.createElement('div');
    pDiv.style.color = "#000000";

    // label
    var paramName = document.createElement('label');
    paramName.style.color = "#ffffff";
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }
    var paramcheck = document.createElement('input');
    paramcheck.type = 'checkbox'
    paramcheck.checked = true;
    paramcheck.classList.add('pull-right');
    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(paramcheck);
    pDiv.appendChild(paramName);

    var inputDiv = document.createElement('div');
    inputDiv.classList.add('form-group');
    inputDiv.classList.add('has-feedback');
    pDiv.appendChild(inputDiv);

    //input
    var dInput = document.createElement('input');
    dInput.id = "dropdown_" + dropdownCount;
    dropdownCount += 1;
    dInput.type = "text";
    dInput.classList.add('form-control');
    inputDiv.appendChild(dInput);

    var icon = document.createElement('span');
    icon.classList.add('glyphicon');
    icon.classList.add('glyphicon-chevron-down');
    icon.classList.add('form-control-feedback');
    inputDiv.appendChild(icon);

    var valArray = param[constants.yamlStrings.value];
    var dropdownAP = new Awesomplete(dInput, { list: valArray, minChars: 0 });
    dropdownAP.evaluate();
    dropdownAP.close();
    dInput.addEventListener('click', () => {
        dropdownAP.open();
    });

    if (constants.yamlStrings.defaultValue in param) {
        dInput.value = param[constants.yamlStrings.defaultValue];
    }

    param[constants.yamlStrings.evaluate] = function () {
        return dInput.value;
    }

    param[constants.yamlStrings.isinclude] = function () {
        return paramcheck.checked;
    }

    return pDiv;
}

function renderFileDialog(param) {
    var pDiv = document.createElement('div');
    pDiv.id = "file_div_" + fileDialogCount;
    fileDialogCount += 1;
    // pDiv.classList.add('input-group');
    pDiv.classList.add('form-group');

    // label
    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }
    var paramcheck = document.createElement('input');
    paramcheck.type = 'checkbox'
    paramcheck.checked = true;
    paramcheck.classList.add('pull-right');
    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(paramcheck);
    pDiv.appendChild(paramName);

    //input div
    var inputDiv = document.createElement('div');
    inputDiv.classList.add('input-group');
    pDiv.appendChild(inputDiv);
    //input
    var paramEdit = document.createElement('input');
    paramEdit.classList.add('form-control');
    paramEdit.type = 'text';
    paramEdit.id = 'file_input_' + fileDialogCount;
    if (constants.yamlStrings.defaultValue in param) {
        paramEdit.value = param[constants.yamlStrings.defaultValue];
    }
    inputDiv.appendChild(paramEdit);

    // File dialog
    var fSpan = document.createElement('span');
    fSpan.classList.add('input-group-btn');
    inputDiv.appendChild(fSpan);
    var fButton = document.createElement('button');
    fButton.id = "File_Button_" + fileDialogCount;
    fButton.classList.add('btn');
    fButton.classList.add('btn-default');
    fButton.type = "submit";
    fSpan.appendChild(fButton);

    var icon = document.createElement('i');
    icon.classList.add('glyphicon');
    icon.classList.add('glyphicon-folder-open');
    fButton.appendChild(icon);

    let options = {
        defaultPath: __dirname
    }

    fButton.addEventListener('click', () => {
        dialog.showOpenDialog(options, (files) => {
            if (files != undefined) {
                paramEdit.value = files[0];
            }
        });
    })

    param['eval'] = function () {
        var valStr = paramEdit.value;
        return (valStr.includes(' '))? '"' + valStr + '"' : valStr;
    }

    param[constants.yamlStrings.isinclude] = function () {
        return paramcheck.checked;
    }

    return pDiv;
}

function createInfo(infoText) {
    var infoIcon = document.createElement('span');
    infoIcon.classList.add('glyphicon');
    infoIcon.classList.add('glyphicon-info-sign');
    infoIcon.setAttribute('data-toggle', 'tooltip');
    infoIcon.setAttribute('title', infoText);
    infoIcon.style.marginRight = "10px";
    return infoIcon;
}

function createTimerInput(timer_id, defaultVal) {
    var timerDiv = document.createElement('div');
    timerDiv.classList.add('timer-div');
    timerDiv.style.verticalAlign = "middle";

    //Creating input
    var hourInput = createTimeInput("hour", 999);
    timerDiv.appendChild(hourInput);
    var hourSep = createTimerSep();
    timerDiv.appendChild(hourSep);
    // timerDiv.insertAdjacentHTML( 'beforeend', '<span>:</span>' );

    var minInput = createTimeInput("mins", 59);
    timerDiv.appendChild(minInput);
    var minSep = createTimerSep();
    timerDiv.appendChild(minSep);

    var secInput = createTimeInput("secs", 59);
    timerDiv.appendChild(secInput);

    //default value
    if (defaultVal != null) {
        try {
            var strArr = defaultVal.split(':');
            var hour = strArr[0];
            var min = strArr[1];
            var sec = strArr[2];
            hourInput.value = hour;
            minInput.value = min;
            secInput.value = sec;
        }
        catch (e) {
            console.log(e);
        }
    }

    var res = {
        'div': timerDiv, 'eval': function () {
            return hourInput.value + ":" + minInput.value + ":" + secInput.value;
        }
    };
    return res;
}

function createTimeInput(timerType, maxVal) {
    var timerInput = document.createElement('input');
    timerInput.classList.add('form-control');
    timerInput.classList.add('timer-input');
    timerInput.type = "number";
    timerInput.min = 0;
    timerInput.max = maxVal;
    timerInput.addEventListener('input', inputSlice);
    timerInput['data-type'] = timerType;

    return timerInput;
}

function createTimerSep() {
    var sep = document.createElement('span');
    sep.style.display = "-webkit-box";
    sep.style["-webkit-box-pack"] = "center";
    sep.style["-webkit-box-align"] = "center";
    sep.innerText = ":";
    return sep;
}

function inputSlice(e) {
    // console.log(e);
    e.target.value = pad(e.target.value, e.target.max);
}

function pad(num, maxVal) {
    size = 2;
    var s = num + "";
    if (s.length >= size) {
        s = s.slice(-2);
        if (parseInt(s) > maxVal) {
            return maxVal + "";
        }
        return s;
    }
    while (s.length < size) s = "0" + s;
    return s;
}

function runCommand(command) {
    //parse the parameters and run the command
    var commandString = "";

    //command name:
    commandString += command[constants.yamlStrings.commandName];
    commandString += " ";

    //add params
    var params = command[constants.yamlStrings.parameterArray];
    var paramCount = params.length;
    var paramList = [];
    for (var i = 0; i < paramCount; i++) {
        var param = params[i];
        if (param[constants.yamlStrings.parameterType] == constants.yamlTypes.markdown) {
            continue;
        }
        if(!param[constants.yamlStrings.isinclude]()){
            continue;
        }
        switch (param[constants.yamlStrings.parameterType]) {
            case constants.yamlTypes.boolean:
                if (param[constants.yamlStrings.evaluate]()) {
                    paramList.push(param[constants.yamlStrings.parameterName]);
                }
                break;
            default:
                var paramElements = [param[constants.yamlStrings.parameterName], param[constants.yamlStrings.evaluate]()];
                paramList.push(paramElements.join(' '));
                break;
        }
    }
    commandString += paramList.join(' ');
    console.log(commandString);

    var terminal = require('./terminal.js');
    terminal.runCommand(commandString);
}

module.exports = {
    renderUI: renderUI
};