const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
// const YAMLPATH = path.join(__dirname, 'example.yaml');


$(document).ready(() => {
    // Do everything here
    
    //Creating Editor
    require('./editor.js');

    // Creating the terminal
    require('./terminal.js');
})

