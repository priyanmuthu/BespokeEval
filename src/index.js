const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const {dialog} = require('electron').remote;
// const YAMLPATH = path.join(__dirname, 'example.yaml');
const Awesomplete = require('awesomplete');


$(document).ready(() => {
    // Do everything here
    
    //Creating Editor
    var editor = require('./editor.js');

    // Creating the terminal
    var terminal = require('./terminal.js');
    terminal.initializeTerminal();
    

    $('#fileDialog').click(() => {
        dialog.showOpenDialog(function(files){
            console.log(files);
        });
    });
})

