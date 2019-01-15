const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
// const YAMLPATH = path.join(__dirname, 'example.yaml');


$(document).ready(() => {
    // Do everything here
    
    //Creating Editor
    var editor = require('./editor.js');

    // Creating the terminal
    var terminal = require('./terminal.js');
    terminal.initializeTerminal();
})

