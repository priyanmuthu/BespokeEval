const fs = require('fs');
const path = require('path');
const { dialog } = require('electron').remote;
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');
// const synthesis = require('./synthesis.js');
const utils = require('./utils.js');

$(document).ready(() => {
    // Do everything here

    //House keeping
    $('#topPanel').height('50%');
    $('#bottomPanel').height('45%');
    $.fn.selectpicker.Constructor.DEFAULTS.template.caret = '';

    //Creating Editor
    var editor = require('./editor.js');
    editor.InitializeEditor();
    // Creating the terminal
    var terminal = require('./terminal.js');
    terminal.initializeTerminal();

    initDynamicResize(editor, terminal);
    initCollapseUI();

    const celljs = require('./cell.js');
    var formDiv = document.getElementById('formDiv');
    var newCell = new celljs.cell();
    formDiv.appendChild(newCell.getInputUI());

    // console.log(synthesis.addCommandEntry('ffmpeg -i input.mp4 -c copy -ss 00:02:20 -t 00:04:00 output.mp4'));
    // synthesis.parseArgs('ffmpeg -i input.mp4 -vn -ab 320 output.mp3');
    // synthesis.parseArgs('git commit -a -m "this is a commit message"');
});



function initDynamicResize(editor, terminal) {
    var window = require('electron').remote.getCurrentWindow();
    window.on('resize', () => {
        resizeUI();
    });

    function resizeUI() {
        editor.editorObj.layout();
        terminal.fitTerminal();
    }
}

function initCollapseUI() {
    $('#panelButton').click(() => {
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
    });
}