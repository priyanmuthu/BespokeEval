const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {dialog} = require('electron').remote;
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');


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

    var window = require('electron').remote.getCurrentWindow();
    window.on('resize', () => {
        console.log('resize');
        resizeUI();
    });
    
    function resizeUI(){
        editor.editorObj.layout();
        terminal.xterm.fit();
    }

    $('#panelButton').click(() => {
        console.log('button click');
        var bottomPanel = '#bottomPanel';
        var topPanel = '#topPanel';
        var panelButtonIcon = '#panelButtonIcon';
        var disp = $('#bottomPanel').css('display');
        console.log($(bottomPanel).height()/$(bottomPanel).parent().height());
        console.log(disp);
        if(disp == 'block'){
            console.log('block -> hidden');
            $(bottomPanel).hide();
            $(bottomPanel).height('0%');
            $(topPanel).height('95%');
            $(panelButtonIcon).removeClass('glyphicon-menu-down');
            $(panelButtonIcon).addClass('glyphicon-menu-up');
        }
        else if(disp == 'none'){
            console.log('hidden -> block');
            //Show the panel
            $(topPanel).height('50%');
            $(bottomPanel).height('45%');
            $(bottomPanel).show();
            $(panelButtonIcon).removeClass('glyphicon-menu-up');
            $(panelButtonIcon).addClass('glyphicon-menu-down');
        }
    });
})

