//Place all the constants here
let stringCount = 0;
let timeCount = 0;
let booleanCount = 0;
let markdownCount = 0;
let dropdownCount = 0;
let fileDialogCount = 0;
let folderDialogCount = 0;
let numberCount = 0;
// This is required
let modalCount = 0;

const utils = require('./utils.js');
const constants = require('./constants.js');
// Using Showdown.js to parse markdown to HTML: https://github.com/showdownjs/showdown
const showdown = require('showdown');
let mdConverter = new showdown.Converter();
const Awesomplete = require('awesomplete');
const { dialog, BrowserWindow } = require('electron').remote;
const path = require('path');
const fs = require('fs');
const editor = require('./editor.js');

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
        var obj = yamlObj[i];
        if (constants.yamlStrings.commandName in obj) {
            var commandDiv = renderCommandUI(obj);
            mainDiv.appendChild(commandDiv);
        }
        else if (constants.yamlStrings.markdown in obj) {
            var mdDiv = renderMarkdown(obj);
            mainDiv.appendChild(mdDiv);
        }
    }
    return mainDiv;
}

function renderScriptUI(scriptObject, scriptUI = null) {
    // Get all the command UI
    var scriptDiv = document.createElement('div');
    if (scriptObject.length == 0) { return scriptDiv; }

    // Edit and run button
    var buttonDiv = document.createElement('div');
    var editButton = document.createElement('button');
    editButton.classList.add('btn');
    editButton.classList.add('btn-default');
    editButton.classList.add('pull-right');
    // editButton.innerText = "Edit";
    editButton.style.minWidth = "40px";
    editButton.style.marginRight = "10px";
    editButton.insertAdjacentHTML('beforeend', '<span class="glyphicon glyphicon-pencil" />');
    editButton.addEventListener("click", () => {
        if (scriptUI !== null) {
            scriptUI.showInput(getScriptString(scriptObject));
        }
    });

    var runButton = document.createElement('button');
    runButton.classList.add('btn');
    runButton.classList.add('btn-primary');
    runButton.classList.add('pull-right');
    // runButton.innerText = "Run";
    runButton.style.minWidth = "40px";
    var rIcon = document.createElement('i');
    rIcon.classList.add('glyphicon');
    rIcon.classList.add('glyphicon-play');
    runButton.appendChild(rIcon);
    runButton.addEventListener("click", () => {
        scriptUI.addScript(getScriptString(scriptObject));
        runScript(scriptObject);
    });
    buttonDiv.appendChild(runButton);
    buttonDiv.appendChild(editButton);
    scriptDiv.appendChild(buttonDiv);

    //for each command
    scriptDiv.appendChild(renderCommandUI(scriptObject[0]));

    for (var i = 1; i < scriptObject.length; i++) {
        var linkDiv = document.createElement('div');
        linkDiv.classList.add('text-center');
        var icon = document.createElement('i');
        icon.classList.add('fa');
        icon.classList.add('fa-link');
        linkDiv.appendChild(icon);
        // linkDiv.insertAdjacentHTML('beforeend', '<strong> pipe </strong>');
        // linkDiv.appendChild(icon.cloneNode(true));
        scriptDiv.appendChild(linkDiv);

        // command div
        scriptDiv.appendChild(renderCommandUI(scriptObject[i]));
    }

    return scriptDiv;
}

function renderCommandUI(command, commandUI = null) {
    //Create a text for command
    var commandUIDiv = document.createElement("div");

    commandHeading = document.createElement('h3');
    commandHeading.innerHTML = commandHeading.innerHTML + "<b>Command:</b> " + command[constants.yamlStrings.commandName];
    commandUIDiv.appendChild(commandHeading);

    var mainParamDiv = document.createElement('div');
    mainParamDiv.id = 'mainParamDiv';
    mainParamDiv.classList.add('grid-form')

    renderParamUI(mainParamDiv, command[constants.yamlStrings.parameterArray]);
    commandUIDiv.appendChild(mainParamDiv);
    return commandUIDiv;
}

function renderMarkdownUI(markdownText, markdownUI) {
    var pDiv = document.createElement('div')
    var editButton = document.createElement('button');
    editButton.classList.add('btn');
    editButton.classList.add('btn-default');
    editButton.classList.add('pull-right');
    editButton.style.minWidth = "40px";
    editButton.style.marginRight = "10px";
    editButton.insertAdjacentHTML('beforeend', '<span class="glyphicon glyphicon-pencil" />');
    editButton.addEventListener("click", () => {
        markdownUI.showInput();
    });
    pDiv.appendChild(editButton);
    pDiv.insertAdjacentHTML('beforeend', mdConverter.makeHtml(markdownText));
    pDiv.addEventListener('dblclick', () => {
        markdownUI.showInput();
    });

    return pDiv;
}

function renderParamUI(mainParamDiv, params) {
    var paramCount = params.length;
    for (var i = 0; i < paramCount; i++) {
        param = params[i];
        var pDiv;

        if (constants.yamlStrings.markdown in param) {
            pDiv = renderMarkdown(param);
            mainParamDiv.appendChild(pDiv);
            continue;
        }

        switch (param[constants.yamlStrings.parameterType]) {
            case constants.yamlTypes.number:
                pDiv = renderNumberParam(param);
                break;
            case constants.yamlTypes.time:
                pDiv = renderTimeParam(param);
                break;
            case constants.yamlTypes.boolean:
                pDiv = renderBooleanParam(param);
                break;
            case constants.yamlTypes.dropdown:
                pDiv = renderDropdownParam(param);
                break;
            case constants.yamlTypes.file:
                pDiv = renderFileDialog(param);
                break;
            case constants.yamlTypes.folder:
                pDiv = renderFolderDialog(param);
                break;
            case constants.yamlTypes.array:
                pDiv = renderArrayParam(param);
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
    stringCount += 1;
    pDiv.classList.add('form-group');

    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
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

        return (valStr.includes(' ')) ? '"' + valStr + '"' : valStr;
    }

    return pDiv;
}

function renderNumberParam(param) {
    //Render the param UI
    var pDiv = document.createElement('div')
    pDiv.id = 'param_string_' + numberCount;
    numberCount += 1;
    pDiv.classList.add('form-group');

    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
    pDiv.appendChild(paramName);

    var inputDiv = document.createElement('div');
    inputDiv.classList.add('form-group');
    pDiv.appendChild(inputDiv);

    var paramEdit = document.createElement('input');
    paramEdit.classList.add('form-control');
    paramEdit.type = 'number';
    paramEdit.step = 'any';
    paramEdit.id = 'input_param_' + numberCount;

    if (constants.yamlStrings.maxValue in param
        && constants.yamlStrings.minValue in param) {
        var rangeSlider = document.createElement('input');
        rangeSlider.type = 'range';
        rangeSlider.classList.add('custom-range');
        rangeSlider.max = param[constants.yamlStrings.maxValue];
        rangeSlider.min = param[constants.yamlStrings.minValue];
        rangeSlider.style.padding = '10px';
        if (constants.yamlStrings.step in param) {
            rangeSlider.step = param[constants.yamlStrings.step];
        }
        if (constants.yamlStrings.defaultValue in param) {
            rangeSlider.value = param[constants.yamlStrings.defaultValue];
        }
        rangeSlider.addEventListener('change', () => {
            paramEdit.value = rangeSlider.value;
        });
        inputDiv.appendChild(rangeSlider);
    }

    if (constants.yamlStrings.defaultValue in param) {
        paramEdit.value = param[constants.yamlStrings.defaultValue];
    }
    if (constants.yamlStrings.step in param) {
        paramEdit.step = param[constants.yamlStrings.step];
    }
    paramEdit.placeholder = param[constants.yamlStrings.parameterName];
    inputDiv.appendChild(paramEdit);

    param[constants.yamlStrings.evaluate] = function () {
        var valStr = paramEdit.value;

        return (valStr.includes(' ')) ? '"' + valStr + '"' : valStr;
    }

    return pDiv;
}

function renderMarkdown(param) {
    var pDiv = document.createElement('div')
    pDiv.id = 'param_md_' + markdownCount;
    pDiv.style['grid-column'] = "1/-1";
    markdownCount = markdownCount + 1;

    // pDiv.insertAdjacentHTML('beforeend', '<br />');
    pDiv.insertAdjacentHTML('beforeend', mdConverter.makeHtml(param[constants.yamlStrings.markdown]));

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

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
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

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
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

    return pDiv;
}

function renderArrayParam(param) {
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

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
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
    console.log(valArray);
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
        var valStr = dInput.value;
        return valStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
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

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
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

    // Button group
    var fSpan = document.createElement('span');
    fSpan.classList.add('input-group-btn');
    inputDiv.appendChild(fSpan);

    // For view file support
    var vButton = document.createElement('button');
    vButton.classList.add('btn');
    vButton.classList.add('btn-default');
    vButton.type = "submit";
    var vIcon = document.createElement('i');
    vIcon.classList.add('fa');
    vIcon.classList.add('fa-eye');
    // vButton.disabled = true;
    vButton.appendChild(vIcon);
    // vButton.setAttribute('data-toggle', 'modal');
    // vButton.setAttribute('data-target', '#' + modalID);
    fSpan.appendChild(vButton);

    var fButton = document.createElement('button');
    fButton.id = "File_Button_" + fileDialogCount;
    fButton.classList.add('btn');
    fButton.classList.add('btn-default');
    fButton.type = "submit";
    var icon = document.createElement('i');
    icon.classList.add('glyphicon');
    icon.classList.add('glyphicon-folder-open');
    fButton.appendChild(icon);
    fSpan.appendChild(fButton);

    var modalHolderDiv = document.createElement('div');
    pDiv.appendChild(modalHolderDiv);

    var filters = [
        { name: 'All Files', extensions: ['*'] }
    ];

    if (constants.yamlStrings.extensions in param) {
        filters.unshift({ name: 'Restricted', extensions: param[constants.yamlStrings.extensions] });
    }

    let options = {
        defaultPath: __dirname,
        filters: filters,
        properties: ['openFile']
    }

    fButton.addEventListener('click', () => {
        dialog.showOpenDialog(options, (files) => {
            if (files != undefined) {
                paramEdit.value = files[0];
            }
        });
    });

    vButton.addEventListener('click', () => {
        viewFile(paramEdit.value, modalHolderDiv)
    });
    // For view file support
    // paramEdit.addEventListener('input', () => {
    //     if (utils.checkIfFilePath(paramEdit.value)) {
    //         if(constants.fileViewSupport.includes(utils.getFileExtension(paramEdit.value))){
    //             vButton.disabled = false;
    //             // Proceed
    //         }
    //     }
    // });

    //TODO: view file support

    param['eval'] = function () {
        var valStr = paramEdit.value;
        return (valStr.includes(' ')) ? '"' + valStr + '"' : valStr;
    }

    return pDiv;
}

function viewFile(filePath, modalHolderDiv) {
    var fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(fullPath);
        alert("file doesn't exists");
        return;
    }
    var ext = utils.getFileExtension(fullPath);
    if (ext in constants.textFiles) {
        showTextFiles(fullPath, modalHolderDiv, constants.textFiles[ext]);
    }
}

function showTextFiles(filePath, holderDiv, fileLang) {
    var modalRes = createModal();
    holderDiv.innerHTML = '';
    holderDiv.appendChild(modalRes.modalDiv);
    var modalBodyDiv = modalRes.modalBodyDiv;
    var editorDiv = document.createElement('div');
    editorDiv.style.width = '100%';
    editorDiv.style.minHeight = '400px';
    modalBodyDiv.appendChild(editorDiv);
    var didContentChange = false;
    onContentChange = function () {
        didContentChange = true;
    }
    var editorObj = editor.InitializeEditor(editorDiv, filePath, fileLang, onContentChange);

    $('#' + modalRes.modalID).on('hide.bs.modal', () => {
        console.log('hide called', didContentChange);
        // if content changed: ask to save
        if (didContentChange) {
            const options = { type: 'info', buttons: ['Save', 'Cancel'], message: 'Save Changes?' };
            dialog.showMessageBox(null, options, (res, checked) => {
                console.log('res');
                if (res == 0) {
                    fs.writeFileSync(filePath, editorObj.getText());
                }
            });
        }
    });

    $('#' + modalRes.modalID).modal('show');

    // Save File
    var modalFooterDiv = modalRes.modalFooterDiv;
    var saveButton = document.createElement('button');
    saveButton.classList.add('btn');
    saveButton.classList.add('btn-default');
    saveButton.innerText = 'Save';
    modalFooterDiv.appendChild(saveButton);
    saveButton.addEventListener('click', () => {
        fs.writeFileSync(filePath, editorObj.getText());
    });
}

function createModal() {
    var modalID = 'fileModal' + modalCount;
    modalCount += 1;
    var modalDiv = document.createElement('div');
    // modalDiv.style.width = '80%';
    modalDiv.id = modalID;
    modalDiv.classList.add('modal');
    modalDiv.classList.add('fade');
    modalDiv.setAttribute('role', 'dialog');
    var modalDialogDiv = document.createElement('div');
    modalDialogDiv.classList.add('modal-dialog');
    modalDialogDiv.classList.add('modal-lg');
    modalDialogDiv.classList.add('modal-dialog-centered');
    modalDialogDiv.setAttribute('role', 'document');
    modalDiv.appendChild(modalDialogDiv);
    var modalContentDiv = document.createElement('div');
    modalContentDiv.classList.add('modal-content');
    modalDialogDiv.appendChild(modalContentDiv);
    modalContentDiv.insertAdjacentHTML('beforeend',
        `
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
    </div>
    `);

    var modalBodyDiv = document.createElement('div');
    modalContentDiv.appendChild(modalBodyDiv);
    modalBodyDiv.innerHTML = '';

    var modalFooterDiv = document.createElement('div');
    modalFooterDiv.classList.add('modal-footer');
    modalContentDiv.appendChild(modalFooterDiv);

    return { modalDiv: modalDiv, modalBodyDiv: modalBodyDiv, modalFooterDiv: modalFooterDiv, modalID: modalID };
}

function renderFolderDialog(param) {
    var pDiv = document.createElement('div');
    pDiv.id = "file_div_" + folderDialogCount;
    folderDialogCount += 1;
    // pDiv.classList.add('input-group');
    pDiv.classList.add('form-group');

    // label
    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    if (constants.yamlStrings.info in param) {
        var infoIcon = createInfo(param[constants.yamlStrings.info]);
        paramName.appendChild(infoIcon);
    }

    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.appendChild(createRightDiv(param));
    pDiv.appendChild(paramName);

    //input div
    var inputDiv = document.createElement('div');
    inputDiv.classList.add('input-group');
    pDiv.appendChild(inputDiv);
    //input
    var paramEdit = document.createElement('input');
    paramEdit.classList.add('form-control');
    paramEdit.type = 'text';
    paramEdit.id = 'file_input_' + folderDialogCount;
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
        defaultPath: __dirname,
        properties: ['openDirectory']
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
        return (valStr.includes(' ')) ? '"' + valStr + '"' : valStr;
    }

    return pDiv;
}

function createRightDiv(param) {
    var rightDiv = document.createElement('div');
    rightDiv.classList.add('pull-right');
    // rightDiv.style.cssFloat = 'left';
    // rightDiv.appendChild(createTypeDropdown(param));
    rightDiv.appendChild(createIncludeCheckbox(param));
    return rightDiv;
}

function createTypeDropdown(param) {
    var dropdownDiv = document.createElement('div');
    dropdownDiv.classList.add('dropdown');
    dropdownDiv.style.cssFloat = 'left';
    dropdownDiv.style.color = '#000000'
    dropdownDiv.style.marginRight = '20px';
    var ddButton = document.createElement('span');
    // ddButton.classList.add('btn');
    // ddButton.classList.add('btn-default');
    ddButton.classList.add('dropdown-toggle');
    ddButton.classList.add('fa');
    ddButton.classList.add('fa-cogs');
    ddButton.style.color = '#FFFFFF';
    // ddButton.type = 'button';
    ddButton.setAttribute('data-toggle', 'dropdown');
    // ddSpan = document.createElement('span');
    // ddSpan.classList.add('caret');
    // ddButton.appendChild(ddSpan);
    dropdownDiv.appendChild(ddButton);

    var uList = document.createElement('ul');
    uList.classList.add('dropdown-menu');
    dropdownDiv.appendChild(uList);
    for (var key in constants.paramTypes) {
        var li = document.createElement('li');
        var link = document.createElement('a');
        link.innerText = key;
        link.href = '#';
        li.appendChild(link);
        uList.appendChild(li);
    }
    return dropdownDiv;
}

function createIncludeCheckbox(param) {
    var paramCheckDiv = document.createElement('div');
    paramCheckDiv.style.cssFloat = 'left';
    var paramCheck = document.createElement('input');
    paramCheck.type = 'checkbox'
    paramCheck.checked = true;
    param[constants.yamlStrings.isinclude] = function () {
        return paramCheck.checked;
    }
    paramCheckDiv.appendChild(paramCheck);
    return paramCheckDiv;
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

function getScriptString(scriptObj) {
    var scriptStringArr = [];
    for (var i in scriptObj) {
        scriptStringArr.push(getCommandString(scriptObj[i]));
    }
    return scriptStringArr.join(" | ");
}

function getCommandString(command) {
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

        if (constants.yamlStrings.markdown in param) {
            continue;
        }
        if (!param[constants.yamlStrings.isinclude]()) {
            continue;
        }
        switch (param[constants.yamlStrings.parameterType]) {
            case constants.yamlTypes.boolean:
                if (param[constants.yamlStrings.evaluate]()) {
                    paramList.push(param[constants.yamlStrings.parameterName]);
                }
                break;
            case constants.yamlTypes.array:
                var valArr = param[constants.yamlStrings.evaluate]();
                for (var v = 0; v < valArr.length; v++) {
                    if (param[constants.yamlStrings.parameterName] !== "") {
                        paramList.push(param[constants.yamlStrings.parameterName]);
                    }
                    paramList.push(valArr[v]);
                }
                break;
            default:
                if (param[constants.yamlStrings.parameterName] !== "") {
                    paramList.push(param[constants.yamlStrings.parameterName]);
                }
                paramList.push(param[constants.yamlStrings.evaluate]());
                break;
        }
    }
    commandString += paramList.join(' ');
    console.log(commandString);

    return commandString;
}

function runScript(script) {
    var scriptString = getScriptString(script);
    require('./terminal.js').runCommand(scriptString);
}

function runCommand(command) {
    var commandString = getCommandString(command);
    require('./terminal.js').runCommand(commandString);
}

module.exports = {
    renderUI: renderUI,
    createUI: createUI,
    renderCommandUI: renderCommandUI,
    renderMarkdownUI: renderMarkdownUI,
    renderScriptUI: renderScriptUI
};