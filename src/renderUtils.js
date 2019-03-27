const utils = require('./utils.js');

function createEditButton() {
    var editButton = document.createElement('button');
    editButton.classList.add('btn');
    editButton.classList.add('btn-default');
    editButton.classList.add('pull-right');
    // editButton.innerText = "Edit";
    editButton.style.minWidth = "40px";
    editButton.style.marginRight = "10px";
    var eIcon = document.createElement('i');
    eIcon.classList.add('glyphicon');
    eIcon.classList.add('glyphicon-pencil');
    editButton.appendChild(eIcon);
    // editButton.insertAdjacentHTML('beforeend', '<span class="glyphicon glyphicon-pencil" />');
    return editButton;
}

function createRunButton() {
    var runButton = document.createElement('button');
    runButton.classList.add('btn');
    runButton.classList.add('btn-primary');
    runButton.classList.add('pull-right');
    runButton.classList.add('run-btn');
    // runButton.innerText = "Run";
    runButton.style.minWidth = "40px";
    var rIcon = document.createElement('i');
    rIcon.classList.add('glyphicon');
    rIcon.classList.add('glyphicon-play');
    runButton.appendChild(rIcon);
    return runButton;
}

function createInfo(infoText) {
    var infoDiv = document.createElement('div');
    var infoIcon = document.createElement('span');
    infoIcon.style.color = '#FFFFFF';
    infoIcon.classList.add('fa');
    infoIcon.classList.add('fa-info-circle');
    infoIcon.setAttribute('data-toggle', 'tooltip');
    infoIcon.setAttribute('title', infoText);
    infoIcon.style.marginRight = "10px";
    infoDiv.appendChild(infoIcon);
    return infoDiv;
}

function createModal() {
    var modalID = utils.getUniqueID();
    var modalDiv = document.createElement('div');
    modalDiv.id = modalID;
    modalDiv.classList.add('modal');
    modalDiv.classList.add('fade');
    modalDiv.setAttribute('role', 'dialog');
    modalDiv.style.maxHeight = constants.modalMaxHeight;
    var modalDialogDiv = document.createElement('div');
    modalDialogDiv.classList.add('modal-dialog');
    modalDialogDiv.classList.add('modal-lg');
    modalDialogDiv.classList.add('modal-dialog-centered');
    modalDialogDiv.setAttribute('role', 'document');
    modalDiv.appendChild(modalDialogDiv);
    var modalContentDiv = document.createElement('div');
    modalContentDiv.classList.add('modal-content');
    modalDialogDiv.appendChild(modalContentDiv);
    modalContentDiv.insertAdjacentHTML('beforeend',
        `
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
    </div>
    `);

    var modalBodyDiv = document.createElement('div');
    modalBodyDiv.style.maxHeight = constants.modalMaxHeight;
    modalContentDiv.appendChild(modalBodyDiv);
    modalBodyDiv.innerHTML = '';

    var modalFooterDiv = document.createElement('div');
    modalFooterDiv.classList.add('modal-footer');
    modalContentDiv.appendChild(modalFooterDiv);

    return { modalDiv: modalDiv, modalBodyDiv: modalBodyDiv, modalFooterDiv: modalFooterDiv, modalID: modalID };
}

function createLabel(param) {
    var labelDiv = document.createElement('div');
    // labelDiv.classList.add('form-inline');
    var paramName = document.createElement('label');
    paramName.style.width = '100%';
    paramName.style.display = 'inline-block';
    paramName.insertAdjacentHTML('beforeend', param[constants.yamlStrings.parameterName]);
    paramName.setAttribute('contenteditable', true);
    paramName.addEventListener('keyup', (ev) => {
        console.log('parameter name changed to: ', paramName.innerText);
        // Modify stuff here
    });
    labelDiv.appendChild(paramName);
    // if (constants.yamlStrings.info in param) {
    //     var infoIcon = createInfo(param[constants.yamlStrings.info]);
    //     infoIcon.style.display = 'inline-block';
    //     labelDiv.appendChild(infoIcon);
    // }

    return labelDiv;
}

module.exports = {
    createEditButton: createEditButton,
    createRunButton: createRunButton,
    createModal: createModal,
    createInfo: createInfo,
    createLabel: createLabel
};
