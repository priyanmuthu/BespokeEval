const fs = require('fs');
const path = require('path');
const { dialog, Menu, app, shell } = require('electron').remote;
const defaultMenu = require('electron-default-menu');
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');
// const synthesis = require('./synthesis.js');
const utils = require('./utils.js');
const celljs = require('./CellUI/cell.js');
const commandUI = require('./CellUI/commandUI.js').commandUI;
const constants = require('./constants.js');
var cellArray = [];

$(document).ready(() => {
    // Do everything here

    //House keeping
    $('#topPanel').height('50%');
    $('#bottomPanel').height('45%');
    $.fn.selectpicker.Constructor.DEFAULTS.template.caret = '';

    // Creating the terminal
    var terminal = require('./terminal.js');
    terminal.initializeTerminal();

    initDynamicResize(terminal);
    initCollapseUI();

    $("#addCellButton").click(() => {
        addCell();
    });

    // Have at least one cell by default
    addCell();

    //Adding Menu
    addMenu();

    $("#historyButton").click(() => {
        showHistory();
    });

    collapsePane();
    var formDiv = document.getElementById('formDiv');
    if(constants.enableDraggable){
        formDiv.classList.add('list-group');
        var sortable = Sortable.create(formDiv, {
            filter: 'input,textarea',
            preventOnFilter: false,
        });
    }
    // console.log(synthesis.addCommandEntry('ffmpeg -i input.mp4 -c copy -ss 00:02:20 -t 00:04:00 output.mp4'));
    // synthesis.parseArgs('ffmpeg -i input.mp4 -vn -ab 320 output.mp3');
    // synthesis.parseArgs('git commit -a -m "this is a commit message"');
});

function showHistory() {
    // console.log(commandUI.commandObjs);
    var historyModalDiv = document.getElementById('historyModalDiv');
    var modalRes = commandUI.getHistory();
    historyModalDiv.appendChild(modalRes.modalDiv);
    $('#'+modalRes.modalID).modal('show');

}

function addMenu() {
    const menu = defaultMenu(app, shell);
    menu.splice(1, 0, {
        label: 'File',
        submenu: [
            {
                label: 'Save to file',
                accelerator: 'CmdOrCtrl+S',
                click(item, focusedWindow) {
                    console.log('clicked save: ', item);
                    saveState();
                }
            },
            {
                label: 'Load from file',
                accelerator: 'CmdOrCtrl+O',
                click(item, focusedWindow) {
                    console.log('clicked load: ', item);
                    loadState();
                }
            }
        ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function saveState() {
    var options = {
        defaultPath: process.cwd(),
        filters: [
            { name: 'YAML', extensions: ['yaml'] }
        ]
    };
    dialog.showSaveDialog(null, options, (path) => {
        if (path === undefined || path === null) { return; }
        var cellState = cellArray.map(c => c.getState());
        var totalState = {};
        totalState[constants.stateStrings.cellArray] = cellState;
        totalState[constants.stateStrings.commandObjs] = commandUI.commandObjs;
        var yamlText = utils.getYAMLText(totalState);
        try {
            fs.writeFileSync(path, yamlText);
        }
        catch (e) {
            console.error(e);
        }
    });
}

function loadState() {
    var options = {
        defaultPath: process.cwd(),
        filters: [
            { name: 'YAML', extensions: ['yaml'] }
        ],
        properties: ['openFile']
    };
    dialog.showOpenDialog(options, (files) => {
        console.log(files);
        if (files === undefined || files == null) { return; }
        var filePath = files[0];

        //Change working directory
        var dirPath = path.dirname(filePath);
        process.chdir(dirPath);
        var rcs = require('./terminal.js').runCommandString;
        rcs('cd '+dirPath);
        rcs('clear');


        var yamlText = fs.readFileSync(filePath);
        var yamlObj = utils.getYAMLObject(yamlText);
        var cellArray = yamlObj[constants.stateStrings.cellArray];
        commandUI.commandObjs = yamlObj[constants.stateStrings.commandObjs];
        clearNotebook();
        for (var i = 0; i < cellArray.length; i++) {
            addCell(cellArray[i]);
        }
    });
}

function addCell(state = null) {
    var formDiv = document.getElementById('formDiv');
    var newCell = new celljs.cell(deleteCell);
    if (state !== undefined && state !== null) { newCell.loadState(state); }
    cellArray.push(newCell);
    formDiv.appendChild(newCell.getUI());
    $('.selectpicker').selectpicker();

}

function clearNotebook() {
    var formDiv = document.getElementById('formDiv');
    formDiv.innerHTML = '';
    cellArray = [];
}

function deleteCell(cellElement) {
    var idx = cellArray.indexOf(cellElement);
    if (idx !== -1) { cellArray.splice(idx, 1); }
    formDiv.removeChild(cellElement);
}


function initDynamicResize(terminal) {
    var window = require('electron').remote.getCurrentWindow();
    window.on('resize', () => {
        resizeUI();
    });

    function resizeUI() {
        terminal.fitTerminal();
    }
}

function initCollapseUI() {
    $('#panelButton').click(() => {
        toggleCollapsePane();
    });
    $('#panelButton').bind('collapse', () => {
        collapsePane();
    });
    $('#panelButton').bind('uncollapse', () => {
        uncollapsePane();
    });
}

function collapsePane(){
    var bottomPanel = '#bottomPanel';
    var topPanel = '#topPanel';
    var panelButtonIcon = '#panelButtonIcon';
    var disp = $('#bottomPanel').css('display');
    if (disp == 'block') {
        $(bottomPanel).hide();
        $(bottomPanel).height('0%');
        $(topPanel).height('95%');
        $(panelButtonIcon).removeClass('glyphicon-menu-down');
        $(panelButtonIcon).addClass('glyphicon-menu-up');
    }
}

function uncollapsePane(){
    var bottomPanel = '#bottomPanel';
    var topPanel = '#topPanel';
    var panelButtonIcon = '#panelButtonIcon';
    var disp = $('#bottomPanel').css('display');
    if (disp == 'none') {
        //Show the panel
        $(topPanel).height('50%');
        $(bottomPanel).height('45%');
        $(bottomPanel).show();
        $(panelButtonIcon).removeClass('glyphicon-menu-up');
        $(panelButtonIcon).addClass('glyphicon-menu-down');
    }
}

function toggleCollapsePane() {
    var disp = $('#bottomPanel').css('display');
    if (disp == 'block') {
        collapsePane();
    }
    else if (disp == 'none') {
        uncollapsePane();
    }
}