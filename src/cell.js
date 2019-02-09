const constants = require('./constants.js');
const synthesis = require('./synthesis.js');
const renderer = require('./renderer.js');

class cell {
    constructor() {
        // initialize cell input
        this.cellElement = null;
        this.inputDiv = null;
        this.uiDiv = null;
        this.cellInput = null;
        this.cellUI = null;

        var cellDiv = document.createElement('div');

        var inputDiv = document.createElement('div');
        inputDiv.style.display = 'block';
        cellDiv.appendChild(inputDiv);

        var inputInnerDiv = document.createElement('div');
        inputInnerDiv.classList.add('input-group');
        inputDiv.appendChild(inputInnerDiv);

        //dropdown choose
        var dropdownDiv = document.createElement('span');
        dropdownDiv.classList.add('input-group-btn');
        inputInnerDiv.appendChild(dropdownDiv);
        var selectList = document.createElement('select');
        // selectList.classList.add('form-control');
        selectList.classList.add('selectpicker');
        selectList.setAttribute('data-width', 'fit');
        dropdownDiv.appendChild(selectList);
        for (var key in constants.cellTypeIcon) {
            var option = document.createElement('option');
            option.value = key;
            option.setAttribute('data-icon', constants.cellTypeIcon[key]);
            selectList.appendChild(option);
        }

        var cellInput = document.createElement('input');
        cellInput.classList.add('form-control');
        cellInput.type = 'text';
        inputInnerDiv.appendChild(cellInput);

        //Run and view button
        var bSpan = document.createElement('span');
        bSpan.classList.add('input-group-btn');
        inputInnerDiv.appendChild(bSpan);
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
        cellDiv.appendChild(uiDiv);

        this.cellElement = cellDiv;
        this.inputDiv = inputDiv;
        this.cellInput = cellInput;
        this.uiDiv = uiDiv;
        this.cellUI = this.createNewUI();

        //event handling
        selectList.addEventListener('change', () => {
            console.log('changed to: ', selectList.value);
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

    getUI() {
        return this.cellElement;
    }

    runRaw(rawText){
        this.cellUI.runRaw(rawText);
    }

    showGUI(rawText) {
        var guiDiv = this.cellUI.getUI(rawText);
        this.uiDiv.innerHTML = '';
        this.uiDiv.appendChild(guiDiv);
        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
    }

    showInput(rawText = null) {
        console.log('showing input');

        if (rawText !== null) {
            this.cellInput.value = rawText;
        }

        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
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
}

class UI {

    constructor(cell) {
        //do something here
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

}

class commandUI extends UI {

    constructor(cell) {
        super(cell);
        this.rawCommands = [];
        this.commandObjs = [];
        this.rawText = "";
        //do something here
    }

    getUI(rawText) {
        // Generate GUI
        this.rawText = rawText;
        var cObj = synthesis.parseArgs(rawText);
        var guiDiv = renderer.renderCommandUI(cObj, this);
        return guiDiv;
    }

    getType() {
        // Proxy for an abstract method
        return constants.cellType.command;
    }

    runRaw(rawText) {
        // Proxy for an abstract method
        require('./terminal.js').runCommand(rawText);
    }

    showInput(rawText) {
        // Proxy for an abstract method
        this.cell.showInput(rawText);
    }
}


class markdownUI extends UI {

    constructor(cell) {
        super(cell);
        this.rawText = "";
        //do something here
    }

    getUI(rawText) {
        // Proxy for an abstract method
        this.rawText = rawText;
        console.log('init cell input here');
    }

    getType() {
        // Proxy for an abstract method
        return constants.cellType.markdown;
    }

    runRaw(rawText) {
        // Proxy for an abstract method
        console.log('running the command');
    }

    showInput(rawText = null) {
        // Proxy for an abstract method
        this.cell.showInput(this.rawText);
    }
}


module.exports.cell = cell;
module.exports.commandUI = commandUI;
module.exports.markdownUI = markdownUI;