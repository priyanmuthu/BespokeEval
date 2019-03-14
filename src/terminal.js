const constants = require('./constants.js');
function initializeTerminal() {
  const os = require('os');
  const pty = require('node-pty');
  const Terminal = require('xterm');
  const fit = require("../node_modules/xterm/lib/addons/fit/fit");
  const synthesis = require('./synthesis.js');
  const editor = require('./editor.js');
  const express = require('express');
  const bodyParser = require('body-parser');
  const utils = require('./utils.js');

  // Initialize command listener before initializing the terminal
  const app = express();
  // app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());
  app.post('/', (req, res) => {
    const postBody = req.body;
    console.log(postBody);
    // var command = postBody.command;
    onCommandEnter(postBody);
    res.send('\n');
  });
  app.listen(constants.trackingPort, () => {
    //do something here
  });

  // Initialize node-pty with an appropriate shell
  const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 10,
    cwd: process.cwd(),
    env: process.env
  });
  // Initialize xterm.js and attach it to the DOM
  Terminal.Terminal.applyAddon(fit);
  const xterm = new Terminal.Terminal();
  xterm.open(document.getElementById('xterm'));
  xterm.setOption('theme', { background: '#282828' });
  fitTerminal();

  // Setup communication between xterm.js and node-pty
  xterm.on('data', (data) => {
    ptyProcess.write(data);
  });

  ptyProcess.on('data', function (data) {
    xterm.write(data);
  });

  console.log('pid', ptyProcess.pid)
  ptyProcess.on('terminate', () => {
    console.log('child process!!!');
  });

  function fitTerminal() {
    xterm.fit();
    ptyProcess.resize(xterm.cols, xterm.rows);
  }

  module.exports.xterm = xterm;
  module.exports.ptyProcess = ptyProcess;
  module.exports.fitTerminal = fitTerminal;

  // // For monitoring commands
  // xterm.on('keydown', (ev) => {
  //   // console.log(ev['key']);
  //   if (ev['key'] == 'Enter') {
  //     xterm.selectAll();
  //     var alllines = xterm.getSelection();
  //     xterm.clearSelection();
  //     var lastLine = alllines.trim().split('\n').slice(-1)[0]
  //     if (lastLine.startsWith("bash-3.2$")) {
  //       var command = lastLine.split("bash-3.2$").slice(-1)[0].trim();
  //       // console.log(alllines);
  //       console.log(command);
  //       onCommandEnter(command);
  //     }
  //   }
  // });

  function onCommandEnter(command) {
    synthesis.addCommandEntry(command);
    editor.setEditorText(synthesis.getSynthesis());
  }

  ptyProcess.on('exit', (code) => {
    // should log 123
    console.log('exit');
    console.log(code);
  });
  module.exports.xterm = xterm;
  module.exports.ptyProcess = ptyProcess;

  // Init processes
  // ptyProcess.write("export PATH=$PATH:$(pwd)/src\r");
  // ptyProcess.write("clear\r");
}

function toggleCommandStart(start = false) {
  if (start) {
    $('#panelButton').trigger('uncollapse');
  }
  if (!constants.enableInteractiveTerminal) {
    $('.run-btn').prop('disabled', start);
  }
  return;
}

function runCommand(commandText) {
  // disable all the run button till command complete
  toggleCommandStart(true);

  runCommandString(commandText);
  waitForCommandComplete(() => {
    toggleCommandStart(false);
  });
}

function waitForCommandComplete(callback) {
  //Get child process
  var isCommandComplete = false;
  var commandCompleteTimer = setInterval(() => {
    // console.log('interval method running');
    getChildProcess(module.exports.ptyProcess.pid, (output) => {
      if (!(/\S/.test(output))) {
        // command complete
        isCommandComplete = true;
      }
    });
    if (isCommandComplete) {
      // Do something. command run complete
      clearInterval(commandCompleteTimer);
      if (callback !== undefined && callback !== null) {
        callback();
      }
    }
  }, 100);
}

function runCommandString(commandText) {
  commandText = commandText.trim();
  commandText = commandText + "\n";
  module.exports.ptyProcess.write(commandText);
}

function getChildProcess(pid, callback) {
  utils.RunCommandAsProcess(`pgrep -P ${pid} -l`, (output) => {
    callback(output);
  });
}

function getCurrentDirectory(callback) {
  utils.RunCommandAsProcess('pwd', (output) => {
    callback(output);
  });
}

module.exports.runCommand = runCommand;
module.exports.initializeTerminal = initializeTerminal;
module.exports.runCommandString = runCommandString;