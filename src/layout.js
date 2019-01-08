$(function () {
    var pstyle = 'border: 1px solid #dfdfdf; padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'top', size: 50, style: pstyle, content: 'top', resizable: true },
            { type: 'left', size: 300, style: pstyle, content: 'left', resizable: true },
            { type: 'main', style: pstyle, content: 'main' }
        ]
    });

    w2ui['layout'].load('main','<div><div id="xterm1" style="width: 100%; height: 100%;"></div></div>', 'blur')
    require('./terminal.js')
  });