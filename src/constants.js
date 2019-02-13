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
    'extensions': 'extensions'
};

const yamlTypes = {
    'string': 'string',
    'markdown': 'md',
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

const trackingPort = 3000; // Do not forget to change in the track.sh file

module.exports = {
    yamlStrings: yamlStrings,
    yamlTypes: yamlTypes,
    trackingPort: trackingPort,
    cellType: cellType,
    cellTypeIcon: cellTypeIcon
};