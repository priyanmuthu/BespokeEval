function initializeTerminal() {
  const os = require('os');
  const pty = require('node-pty');
  const Terminal = require('xterm');
  const fit = require("../node_modules/xterm/lib/addons/fit/fit");
  const synthesis = require('./synthesis.js');
  const editor = require('./editor.js');
  // import * as fit from 'xterm/lib/addons/fit/fit';
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

  function fitTerminal() {
    xterm.fit();
    ptyProcess.resize(xterm.cols, xterm.rows);
  }

  module.exports.xterm = xterm;
  module.exports.ptyProcess = ptyProcess;
  module.exports.fitTerminal = fitTerminal;

  // For monitoring commands
  xterm.on('keydown', (ev) => {
    // console.log(ev['key']);
    if (ev['key'] == 'Enter') {
      xterm.selectAll();
      var alllines = xterm.getSelection();
      xterm.clearSelection();
      var lastLine = alllines.trim().split('\n').slice(-1)[0]
      if (lastLine.startsWith("bash-3.2$")) {
        var command = lastLine.split("bash-3.2$").slice(-1)[0].trim();
        // console.log(alllines);
        console.log(command);
        onCommandEnter(command);
      }
    }
  });

  function onCommandEnter(command) {
    synthesis.addCommandEntry(command);
    editor.setEditorText(synthesis.getSynthesis());
  }

  ptyProcess.on('data', function (data) {
    xterm.write(data);
  });

  ptyProcess.on('exit', (code) => {
    // should log 123
    console.log('exit');
    console.log(code);
  });

  module.exports.xterm = xterm;
  module.exports.ptyProcess = ptyProcess;
}

function runCommand(commandText) {
  commandText = commandText.trim();
  commandText = commandText + "\n";
  // xterm.write(commandText);
  module.exports.ptyProcess.write(commandText);
}


module.exports.runCommand = runCommand;
module.exports.initializeTerminal = initializeTerminal;