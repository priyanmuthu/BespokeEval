const fs = require('fs');
const path = require('path');
const { dialog } = require('electron').remote;
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');
// const synthesis = require('./synthesis.js');
const utils = require('./utils.js');
const celljs = require('./cell.js');
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

    collapseUI();
    // console.log(synthesis.addCommandEntry('ffmpeg -i input.mp4 -c copy -ss 00:02:20 -t 00:04:00 output.mp4'));
    // synthesis.parseArgs('ffmpeg -i input.mp4 -vn -ab 320 output.mp3');
    // synthesis.parseArgs('git commit -a -m "this is a commit message"');
});

function addCell() {
    var formDiv = document.getElementById('formDiv');
    var newCell = new celljs.cell(deleteCell);
    cellArray.push(newCell);
    formDiv.appendChild(newCell.getUI());
    $('.selectpicker').selectpicker();
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
        collapseUI();
    });
}

function collapseUI() {
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
    else if (disp == 'none') {
        //Show the panel
        $(topPanel).height('50%');
        $(bottomPanel).height('45%');
        $(bottomPanel).show();
        $(panelButtonIcon).removeClass('glyphicon-menu-up');
        $(panelButtonIcon).addClass('glyphicon-menu-down');
    }
}