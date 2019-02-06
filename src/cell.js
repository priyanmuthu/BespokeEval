const constants = require('./constants.js');

class cell {
    constructor() {
        // initialize cell input
    }

    getInputUI() {
        var cellDiv = document.createElement('div');
        cellDiv.classList.add('form-group');
        // cellDiv.classList.add('input-group');

        var inputDiv = document.createElement('div');
        cellDiv.appendChild(inputDiv);
        inputDiv.classList.add('input-group');

        //dropdown choose
        var dropdownDiv = document.createElement('span');
        dropdownDiv.classList.add('input-group-btn');
        inputDiv.appendChild(dropdownDiv);
        var selectList = document.createElement('select');
        // selectList.classList.add('form-control');
        selectList.classList.add('selectpicker');
        selectList.style.minWidth = '40px';
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
        inputDiv.appendChild(cellInput);

        //Run and view button
        var bSpan = document.createElement('span');
        bSpan.classList.add('input-group-btn');
        inputDiv.appendChild(bSpan);
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

        //event handling
        selectList.addEventListener('change', () => {
            console.log('changed to: ', selectList.value);
        });

        return cellDiv;

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
}

class commandUI extends UI {

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
        return constants.cellType.command;
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
}


module.exports.cell = cell;
module.exports.commandUI = commandUI;
module.exports.markdownUI = markdownUI;