const yamlStrings = {
    'commandName': 'command',
    'parameterArray': 'params',
    'parameterType': 'type',
    'markdown': 'md',
    'parameterName': 'parameter',
    'evaluate': 'eval',
    'isinclude': 'isinclude',
    'defaultValue':'default',
    'info': 'info',
    'value': 'value',
    'required': 'required',
    'rawCommand': 'raw',
    'minValue': 'min',
    'maxValue': 'max',
    'extensions': 'extensions',
    'rawText': 'rawText',
    'commandObjects': 'commandObjects',
    'renderObject': 'renderObject',
    'cellType': 'cellType',
    'step': 'step'
};

const yamlTypes = {
    'string': 'string',
    'markdown': 'md',
    'boolean': 'boolean',
    'time': 'time',
    'dropdown': 'dropdown',
    'file': 'file',
    'folder': 'folder',
    'number': 'number',
    'array': 'array',
    'arrayFiles': 'arrayFiles'
};

const paramTypes = {
    'string': 'string',
    'boolean': 'boolean',
    'time': 'time',
    'dropdown': 'dropdown',
    'file': 'file',
    'folder': 'folder',
    'number': 'number'
};

const cellType = {
    command: 0,
    markdown: 1
}

const cellTypeIcon = {
    command: 'glyphicon-console',
    markdown: 'glyphicon-font'
}

const textFiles = {
    'json': 'json',
    'config': 'text',
    'txt': 'text',
    'yaml': 'yaml',
    'md': 'markdown',
    'js': 'javascript',
    'xml': 'xml'
};

const videoFiles = {
    'mp4': 'video/mp4'
}

const modalMaxHeight = '900px';

const trackingPort = 3000; // Do not forget to change in the track.sh file

module.exports = {
    yamlStrings: yamlStrings,
    yamlTypes: yamlTypes,
    trackingPort: trackingPort,
    cellType: cellType,
    cellTypeIcon: cellTypeIcon,
    textFiles: textFiles,
    videoFiles: videoFiles,
    paramTypes: paramTypes,
    modalMaxHeight: modalMaxHeight
};