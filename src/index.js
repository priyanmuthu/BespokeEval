const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { dialog } = require('electron').remote;
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');
const yargsParser = require('yargs-parser');
const parserConfig = {'configuration': {'short-option-groups': false}};


$(document).ready(() => {
    // Do everything here

    //House keeping
    $('#topPanel').height('50%');
    $('#bottomPanel').height('45%');

    //Creating Editor
    var editor = require('./editor.js');
    // Creating the terminal
    var terminal = require('./terminal.js');
    terminal.initializeTerminal();


    initDynamicResize(editor, terminal);
    initCollapseUI();
    
    console.log(parseArgs('ffmpeg -i input.mp4 -c copy -ss 00:02:20 -t 00:04:00 output.mp4'));
});

function parseArgs(commandStr) {
    return yargsParser(commandStr, parserConfig);
}

function initDynamicResize(editor, terminal) {
    var window = require('electron').remote.getCurrentWindow();
    window.on('resize', () => {
        resizeUI();
    });

    function resizeUI() {
        editor.editorObj.layout();
        terminal.xterm.fit();
        terminal.xterm.fit();
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

