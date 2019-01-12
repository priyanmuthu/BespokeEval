(() => {
    const path = require("path");
    const amdLoader = require("../node_modules/monaco-editor/min/vs/loader.js");
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    console.log(__dirname);
    const fs = require("fs");
    let editor;
    function uriFromPath(pathstr) {
        let pathName = path.resolve(pathstr).replace(/\\/g, "/");
        if (pathName.length > 0 && pathName.charAt(0) !== "/") {
            pathName = "/" + pathName;
        }
        return encodeURI("file://" + pathName);
    }

    amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, "../node_modules/monaco-editor/min"))
    });
    // workaround monaco-css not understanding the environment
    // self.module = undefined;
    amdRequire(["vs/editor/editor.main"], () => {
        editor = monaco.editor.create(document.getElementById("editordiv"), {
            value: "{\n\t\"Hello\":\"world\"\n}",
            language: "yaml",
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: "vs-dark"
        });

        const yaml_text = getYAMLText();
        if(null != yaml_text){
            editor.setModel(monaco.editor.createModel(yaml_text, "yaml"));
        }

        // Content Change event
        editor.onDidChangeModelContent((e) => {
            console.log("content changed");
        });
    });
})();

