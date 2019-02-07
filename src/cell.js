const constants = require('./constants.js');
const synthesis = require('./synthesis.js');
const renderer = require('./renderer.js');

class cell {
    constructor() {
        // initialize cell input
        this.cellElement = null;
        this.uiElement = null;
        this.inputDiv = null;
        this.uiDiv = null;
        this.cellInput = null;
    }

    getUI() {
        if (this.cellElement !== null) {
            return cellElement;
        }
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

        return this.cellElement;
    }

    runRaw(rawText) {

    }

    showGUI(rawText) {
        console.log('showing GUI for: ', rawText);

        // Generate GUI
        var cObj = synthesis.parseArgs(rawText);
        console.log(cObj);
        var guiDiv = renderer.renderCommandUI(cObj, this);
        console.log(guiDiv)
        this.uiDiv.innerHTML = '';
        this.uiDiv.appendChild(guiDiv);

        this.inputDiv.style.display = 'none';
        this.uiDiv.style.display = 'block';
    }

    showInput() {
        console.log('showing input');

        // Generate Text

        this.uiDiv.style.display = 'none';
        this.inputDiv.style.display = 'block';
    }
}

class UI {

    constructor() {
        //do something here
        var UIDiv = null
    }

    getUI() {
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

    runGUI() {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

}

class commandUI extends UI {

    constructor() {
        super();
        this.rawCommands = [];
        this.commandObjs = [];
        //do something here
    }

    getUI() {
        // Proxy for an abstract method
        console.log('init cell input here');
    }

    getType() {
        // Proxy for an abstract method
        return constants.cellType.command;
    }

    runRaw(rawText) {
        // Proxy for an abstract method
        console.log('running the command');
    }

    runGUI() {
        // Proxy for an abstract method
        console.log('running the command');
    }
}


class markdownUI extends UI {

    constructor() {
        super();
        //do something here
    }

    getUI() {
        // Proxy for an abstract method
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

    runGUI() {
        // Proxy for an abstract method
        console.log('running the command');
    }
}


module.exports.cell = cell;
module.exports.commandUI = commandUI;
module.exports.markdownUI = markdownUI;