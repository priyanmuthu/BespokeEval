// let editor;
(function() {
    const path = require('path');
    const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    const fs = require('fs');
    const utils = require('./utils.js')
    const YAMLPATH = path.join(__dirname, 'example.yaml');
    // var editor;
    function uriFromPath(_path) {
        var pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    }

    amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, '../node_modules/monaco-editor/min'))
    });
    // workaround monaco-css not understanding the environment
    self.module = undefined;
    amdRequire(['vs/editor/editor.main'], function() {
        window.editor = monaco.editor.create(document.getElementById('editordiv'), {
            value: "{\n\t\"Hello\":\"world\"\n}",
            language: "yaml",

            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: "vs-dark"
        });

        var yaml_text = utils.readFileText(YAMLPATH);
        if(null != yaml_text){
            window.editor.setModel(monaco.editor.createModel(yaml_text, 'yaml'));
            renderUI();
        }

        //Content Change event
        editor.onDidChangeModelContent(function (e) {
            console.log('content changed');
            renderUI();
        });
    });
})();

