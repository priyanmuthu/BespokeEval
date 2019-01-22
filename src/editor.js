// let editor;
(function() {
    const path = require('path');
    const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    const fs = require('fs');
    const utils = require('./utils.js')
    var renderer = require('./renderer.js');
    // const YAMLPATH = path.join(__dirname, 'example.yaml');
    const YAMLPATH = path.join(__dirname, 'mdexample.yaml');
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
            value: "",
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
            renderer.renderUI();
        }

        /**
         * Addds content changed listener to `editor` and invokes `callback` 100ms after the last content changed event.
         */
        function onDidChangeModelContentDebounced(editor, callback) {
            var timer = -1;
            var runner = function() {
            timer = -1;
            callback();
            }
            return editor.onDidChangeModelContent(function(e) {
            if (timer !== -1) {
                clearTimeout(timer);
            }
            timer = setTimeout(runner, 1000);
            });
        }

        onDidChangeModelContentDebounced(editor, () => {
            console.log('changed content');
            renderer.renderUI();
        });

        //Content Change event
        // editor.onDidChangeModelContent(function (e) {
        //     console.log('content changed');
        //     renderer.renderUI();
        // });
    });
})();

