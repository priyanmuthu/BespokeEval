const UI = require('./UI.js').UI;
const constants = require('../constants.js');
const renderer = require('../renderer.js');
const synthesis = require('../synthesis.js');
const utils = require('../utils.js');

class commandUI extends UI {

    constructor(cell) {
        super(cell);
        if (commandUI.commandObjs === undefined) {
            commandUI.commandObjs = {};
        }
        if (commandUI.manualObjs === undefined) {
            commandUI.manualObjs = {};
        }
        this.rawText = "";
        this.renderObj = null;
        // initialize cell input
        this.cellElement = null;
        this.inputDiv = null;
        this.uiDiv = null;
        this.cellInput = null;
        this.UIVisible = false;

        var cellDiv = document.createElement('div');

        var inputDiv = document.createElement('div');
        inputDiv.style.padding = '5px';
        inputDiv.classList.add('cellselect');
        inputDiv.style.display = 'block';
        cellDiv.appendChild(inputDiv);

        var inputInnerDiv = document.createElement('div');
        inputInnerDiv.classList.add('input-group');
        inputDiv.appendChild(inputInnerDiv);

        //dropdown choose
        var dropdownDiv = document.createElement('span');
        dropdownDiv.classList.add('input-group-addon');
        inputInnerDiv.appendChild(dropdownDiv);
        var selectList = document.createElement('select');
        // selectList.classList.add('form-control');
        selectList.classList.add('selectpicker');
        selectList.setAttribute('data-width', 'fit');
        dropdownDiv.appendChild(selectList);
        for (var key in constants.cellType) {
            var option = document.createElement('option');
            option.value = constants.cellType[key];
            option.setAttribute('data-icon', constants.cellTypeIcon[key]);
            selectList.appendChild(option);
        }
        var cellInput = document.createElement('input');
        cellInput.classList.add('form-control');
        cellInput.type = 'text';
        var heightLimit = 60;
        cellInput.style.minHeight = heightLimit + 'px';
        inputInnerDiv.appendChild(cellInput);

        //Run and view button
        var bSpan = document.createElement('span');
        bSpan.classList.add('input-group-addon');
        inputInnerDiv.appendChild(bSpan);

        //delete button
        var deleteButton = document.createElement('button');
        deleteButton.classList.add('btn');
        deleteButton.classList.add('btn-default');
        deleteButton.type = "submit";
        bSpan.appendChild(deleteButton);
        var dIcon = document.createElement('i');
        dIcon.classList.add('glyphicon');
        dIcon.classList.add('glyphicon-trash');
        deleteButton.appendChild(dIcon);
        deleteButton.addEventListener('click', () => {
            this.delete();
        });

        //view button
        var viewButton = document.createElement('button');
        viewButton.classList.add('btn');
        viewButton.classList.add('btn-default');
        viewButton.type = "submit";
        bSpan.appendChild(viewButton);
        var vIcon = document.createElement('i');
        vIcon.classList.add('glyphicon');
        vIcon.classList.add('glyphicon-tasks');
        viewButton.appendChild(vIcon);
        viewButton.addEventListener('click', () => {
            this.showGUI(cellInput.value);
        });

        //Run button
        var runButton = document.createElement('button');
        runButton.classList.add('btn');
        runButton.classList.add('btn-default');
        runButton.classList.add('run-btn');
        runButton.type = "submit";
        bSpan.appendChild(runButton);
        var rIcon = document.createElement('i');
        rIcon.classList.add('glyphicon');
        rIcon.classList.add('glyphicon-play');
        runButton.appendChild(rIcon);
        runButton.addEventListener('click', () => {
            this.runRaw(cellInput.value);
        });

        // Creating the GUI div
        var uiDiv = document.createElement('div');
        uiDiv.style.display = 'none';
        uiDiv.style.borderStyle = 'solid';
        uiDiv.style.borderWidth = '2px';
        uiDiv.style.borderColor = '#404040';
        uiDiv.style.borderRadius = '10px';
        uiDiv.style.padding = '10px';
        cellDiv.appendChild(uiDiv);

        this.cellElement = cellDiv;
        this.inputDiv = inputDiv;
        this.cellInput = cellInput;
        this.uiDiv = uiDiv;
        // this.cellUI = this.createNewUI();
        this.runButton = runButton;

        //event handling
        selectList.addEventListener('change', () => {
            this.selectionChange(selectList.value, cellInput.value);
        });
        cellInput.addEventListener('keypress', (ev) => {
            if (ev.key === "Enter") {
                if (ev.ctrlKey) {
                    this.runRaw(cellInput.value);
                }
                else {
                    this.showGUI(cellInput.value);
                }
            }
        });
    }

    static getHistory() {
        return renderer.renderHistoryList(commandUI.commandObjs);
    }

    getUI(rawText = '') {
        console.log('getui', rawText);
        if (rawText !== undefined && rawText !== null) {
            this.cellInput.value = rawText;
        }
        return this.cellElement;
    }

    updateManualPreference(commandName, paramName, paramObject) {
        if(!(commandName in commandUI.manualObjs)){
            commandUI.manualObjs[commandName] = {};
        }
        commandUI.manualObjs[commandName][paramName] = utils.paramCopy(paramObject);

        console.log(commandUI.manualObjs, paramObject);
    }

    showGUI(rawText) {
        if (rawText === "") { return; }
        // Generate GUI
        if (this.rawText !== rawText) {
            this.addScript(rawText);
        }
        this.rawText = rawText;
        this.renderScript(rawText);
        this.toggleUIDiv();
    }

    addScript(scriptText) {
        var sObj = synthesis.parseScript(scriptText);
        sObj.forEach((c, i) => {
            var key = c[constants.yamlStrings.commandName];
            if (key in commandUI.commandObjs) {
                commandUI.commandObjs[key].push(c);
            }
            else {
                commandUI.commandObjs[key] = [c];
            }
        });
    }

    renderScript(scriptText) {
        console.log(commandUI.commandObjs, scriptText);
        var mergedObject = synthesis.mergeScriptObjects(commandUI.commandObjs, commandUI.manualObjs,
            synthesis.parseScript(scriptText));
        this.renderObj = mergedObject;
        var guiDiv = renderer.renderScriptUI(mergedObject, this);

        this.uiDiv.innerHTML = '';
        this.uiDiv.appendChild(guiDiv);
    }

    showInput(rawText = null) {
        if (rawText !== null) {
            this.cellInput.value = rawText;
        }
        this.toggleInputDiv();
    }

    toggleUIDiv() {
        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
        this.UIVisible = true;
    }

    toggleInputDiv() {
        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
        this.UIVisible = false;
    }

    getType() {
        return constants.cellType.command;
    }

    runRaw(rawText) {
        if (rawText === "") { return; }
        require('../terminal.js').runCommand(rawText);
        this.addScript(rawText);
    }

    selectionChange(cellType, rawText) {
        // console.log('selection change');
        this.cell.selectionChange(cellType, rawText);
    }

    getState() {
        var state = {};
        state[constants.stateStrings.cellInput] = this.cellInput.value;
        state[constants.stateStrings.rawText] = this.rawText;
        // state[constants.stateStrings.commandObjects] = commandUI.commandObjs;
        state[constants.stateStrings.renderObject] = this.renderObj;
        state[constants.stateStrings.UIVisible] = this.UIVisible;
        state[constants.stateStrings.cellType] = this.getType();
        return state;

    }

    loadState(state) {
        this.rawText = state[constants.stateStrings.rawText];
        // commandUI.commandObjs = state[constants.stateStrings.commandObjects];
        this.cellInput.value = state[constants.stateStrings.cellInput];
        this.renderObj = state[constants.stateStrings.renderObject];
        this.UIVisible = state[constants.stateStrings.UIVisible];
        if (this.UIVisible) {
            this.showGUI(this.cellInput.value);
        }
    }
}

module.exports.commandUI = commandUI;