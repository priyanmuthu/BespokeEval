const constants = require('./constants.js');
const synthesis = require('./synthesis.js');
const renderer = require('./renderer.js');

class cell {
    constructor(deleteCell) {
        this.deleteCell = deleteCell;
        this.cDiv = document.createElement('div');
        // this.cDiv.addEventListener('focusin', () => {
        //     console.log('focused');
        // });
        this.cellUI = this.createNewUI();
        this.cDiv.appendChild(this.cellUI.getUI());
        $('.selectpicker').selectpicker();
    }

    getUI() {
        return this.cDiv;
    }

    selectionChange(cellType, rawText = '') {
        // Dump the current cell object and create a new cell object
        cellType = Number(cellType);
        this.cellUI = this.createNewUI(cellType);
        this.cDiv.innerHTML = '';
        this.cDiv.appendChild(this.cellUI.getUI(rawText));
        $('.selectpicker').selectpicker();
    }

    createNewUI(cellType = constants.cellType.command) {
        switch (cellType) {
            case constants.cellType.markdown:
                return new markdownUI(this);
            case constants.cellType.command:
            default:
                return new commandUI(this);
        }
    }

    delete() {
        this.deleteCell(this.cDiv);
    }

    getState() {
        return this.cellUI.getState();
    }

    loadState(state) {
        this.selectionChange(state[constants.yamlStrings.cellType]);
        this.cellUI.loadState(state);
    }
}

class UI {

    constructor(cell) {
        this.cell = cell;
    }

    getUI(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    getType() {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    runRaw(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    showInput(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    delete() {
        this.cell.delete();
    }

    getState() {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    loadState(state) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

}

class commandUI extends UI {

    constructor(cell) {
        super(cell);
        this.commandObjs = {};
        this.rawText = "";
        this.renderObj = null;
        // initialize cell input
        this.cellElement = null;
        this.inputDiv = null;
        this.uiDiv = null;
        this.cellInput = null;

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
        for (var key in constants.cellTypeIcon) {
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

    getUI(rawText = '') {
        this.cellInput.value = rawText;
        return this.cellElement;
    }

    showGUI(rawText) {
        if (rawText === "") { return; }
        // Generate GUI
        if (this.rawText !== rawText) {
            this.rawText = rawText;
            var sObj = synthesis.parseScript(rawText);
            sObj.forEach((c, i) => {
                var key = c[constants.yamlStrings.commandName];
                if (key in this.commandObjs) {
                    this.commandObjs[key].push(c);
                }
                else {
                    this.commandObjs[key] = [c];
                }
            });

            var mergedObject = synthesis.mergeScriptObjects(this.commandObjs,
                synthesis.parseScript(rawText));

            var guiDiv = renderer.renderScriptUI(mergedObject, this);

            this.uiDiv.innerHTML = '';
            this.uiDiv.appendChild(guiDiv);
        }
        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
    }

    showInput(rawText = null) {
        if (rawText !== null) {
            this.cellInput.value = rawText;
        }
        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
    }

    toggleUIDiv() {
        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
    }

    toggleInputDiv() {
        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
    }

    getType() {
        return constants.cellType.command;
    }

    runRaw(rawText) {
        if (rawText === "") { return; }
        require('./terminal.js').runCommand(rawText);
    }

    selectionChange(cellType, rawText) {
        // console.log('selection change');
        this.cell.selectionChange(cellType, rawText);
    }

    getState() {
        var state = {};
        state[constants.yamlStrings.rawText] = this.cellInput.value;
        state[constants.yamlStrings.commandObjects] = this.commandObjs;
        state[constants.yamlStrings.renderObject] = this.renderObj;
        state[constants.yamlStrings.cellType] = this.getType();
        return state;

    }

    loadState(state) {
        this.rawText = '';//;
        this.commandObjs = state[constants.yamlStrings.commandObjects];
        this.cellInput.value = state[constants.yamlStrings.rawText];
        this.renderObj = state[constants.yamlStrings.renderObject];
    }

}


class markdownUI extends UI {

    constructor(cell) {
        super(cell);
        this.rawText = "";
        // initialize cell input
        this.cellElement = null;
        this.inputDiv = null;
        this.uiDiv = null;
        this.cellInput = null;

        var cellDiv = document.createElement('div');

        var inputDiv = document.createElement('div');
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
        for (var key in constants.cellTypeIcon) {
            var option = document.createElement('option');
            option.value = constants.cellType[key];
            option.setAttribute('data-icon', constants.cellTypeIcon[key]);
            selectList.appendChild(option);
        }
        selectList.selectedIndex = constants.cellType.markdown;

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

        // Creating the GUI div
        var uiDiv = document.createElement('div');
        uiDiv.style.display = 'none';
        cellDiv.appendChild(uiDiv);

        this.cellElement = cellDiv;
        this.inputDiv = inputDiv;
        this.cellInput = cellInput;
        this.uiDiv = uiDiv;

        //event handling
        selectList.addEventListener('change', () => {
            this.selectionChange(selectList.value, cellInput.value);
        });
        cellInput.addEventListener('keypress', (ev) => {
            if (ev.key === "Enter") {
                if (ev.ctrlKey) {
                    this.showGUI(cellInput.value);
                }
                else if (ev.shiftKey) {
                    this.showGUI(cellInput.value);
                }
            }
        });
    }

    getUI(rawText = '') {
        this.cellInput.value = rawText;
        return this.cellElement;
    }

    showGUI(rawText) {
        if (rawText === "") { return; }
        // Generate GUI
        this.rawText = rawText;
        var guiDiv = renderer.renderMarkdownUI(rawText, this);
        this.uiDiv.innerHTML = '';
        this.uiDiv.appendChild(guiDiv);
        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
    }

    getType() {
        return constants.cellType.markdown;
    }

    showInput(rawText = null) {
        if (rawText !== null) {
            this.cellInput.value = rawText;
        }
        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
    }

    runRaw(rawText) {
        // Do nothing
    }

    selectionChange(cellType, rawText) {
        // console.log('selection change');
        this.cell.selectionChange(cellType, rawText);
    }

    getState() {
        var state = {};
        state[constants.yamlStrings.rawText] = this.cellInput.value;
        state[constants.yamlStrings.cellType] = this.getType();
        return state;
    }

    loadState(state) {
        this.cellInput.value = state[constants.yamlStrings.rawText];
    }
}


module.exports.cell = cell;
module.exports.commandUI = commandUI;
module.exports.markdownUI = markdownUI;