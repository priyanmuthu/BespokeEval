(function() {
    const path = require('path');
    const amdLoader = require('../node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    const fs = require('fs');
    var editor;
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
        editor = monaco.editor.create(document.getElementById('editordiv'), {
            value: "{\n\t\"Hello\":\"world\"\n}",
            language: "yaml",

            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: "vs-dark"
        });
        
        //Testing
        // var yamlpath = path.join(__dirname, 'example.yaml');
        // console.log(yamlpath);
        // var yaml_text = ""
        // fs.readFile(yamlpath, 'utf8', (err, res) => {
        // if (!err) {
        //     editor.setModel(monaco.editor.createModel(res, 'yaml'));
        //     yaml_text = res;
        // }
        // });

        var yaml_text = getYAMLText();
        if(null != yaml_text){
            editor.setModel(monaco.editor.createModel(yaml_text, 'yaml'));
        }

        //Content Change event
        editor.onDidChangeModelContent(function (e) {
            console.log('content changed');
        });
    });
})();

