const UI = require('./UI.js').UI;
const constants = require('../constants.js');
const renderer = require('../renderer.js');

class rawScriptUI extends UI {

    constructor(cell) {
        super(cell);
        this.rawText = "";
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
        selectList.selectedIndex = constants.cellType.raw;

        var cellInput = document.createElement('textarea');
        cellInput.classList.add('form-control');
        cellInput.rows = 2;
        cellInput.style.resize = 'vertical';
        var heightLimit = 60;
        cellInput.style.minHeight = heightLimit + 'px';
        cellInput.oninput = function () {
            // textarea.style.height = ""; /* Reset the height*/
            cellInput.style.height = Math.max(cellInput.scrollHeight, heightLimit) + "px";
        };
        inputInnerDiv.appendChild(cellInput);

        //delete and view button
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
                else if (ev.shiftKey) {
                    this.showGUI(cellInput.value);
                }
            }
        });
    }

    getUI(rawText = '') {
        if (rawText !== undefined && rawText !== null) {
            this.cellInput.value = rawText;
        }
        return this.cellElement;
    }

    showGUI(rawText) {
        if (rawText === "") { return; }
        // Generate GUI
        if (this.rawText !== rawText) {
            this.rawText = rawText;
            console.log('rendering raw script');
            this.renderRawScript(rawText);
        }
        this.toggleUIDiv()
    }

    renderRawScript(rawScript) {
        var guiDiv = renderer.renderRawScript(rawScript, this);

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
        return constants.cellType.raw;
    }

    runRaw(rawText) {
        if (rawText === "") { return; }
        require('../terminal.js').runCommand(rawText);
    }

    selectionChange(cellType, rawText) {
        // console.log('selection change');
        this.cell.selectionChange(cellType, rawText);
    }

    getState() {
        var state = {};
        state[constants.yamlStrings.rawText] = this.cellInput.value;
        state[constants.yamlStrings.cellType] = this.getType();
        state[constants.stateStrings.UIVisible] = this.UIVisible;
        return state;

    }

    loadState(state) {
        this.rawText = '';//;
        this.cellInput.value = state[constants.yamlStrings.rawText];
        this.UIVisible = state[constants.stateStrings.UIVisible];
        if(this.UIVisible){
            this.showGUI(this.cellInput.value);
        }
    }
}

module.exports.rawScriptUI = rawScriptUI;