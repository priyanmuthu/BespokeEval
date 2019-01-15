function initializeTerminal() {
  var os = require('os');
  var pty = require('node-pty');
  var Terminal = require('xterm').Terminal;
  // Initialize node-pty with an appropriate shell
  const shell = process.env[os.platform() === 'win32' ? 'COMSPEC' : 'SHELL'];
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });
  // Initialize xterm.js and attach it to the DOM
  const xterm = new Terminal();
  xterm.open(document.getElementById('xterm'));

  xterm.setOption('theme', { background: '#282828' });

  // Setup communication between xterm.js and node-pty
  xterm.on('data', (data) => {
    ptyProcess.write(data);
  });

  // For monitoring commands
  // xterm.on('keydown', (ev) => {
  //   // console.log(ev['key']);
  //   if(ev['key']=='Enter'){
  //     xterm.selectAll();
  //     var alllines = xterm.getSelection();
  //     xterm.clearSelection();
  //     alllines = alllines.trim()
  //     console.log(alllines);
  //   }
  // })

  ptyProcess.on('data', function (data) {
    xterm.write(data);
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