var messenger = require('messenger');

const express = require('express');
const request = require('request');

var command = process.argv.slice(2).join(' ');
console.log(command);
const port = 3000;

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}

// Configure the request
var options = {
    url: 'http://localhost:3000/',
    method: 'POST',
    headers: headers,
    form: {'command': command}
}

// Start the request
request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        console.log(body)
    }
});