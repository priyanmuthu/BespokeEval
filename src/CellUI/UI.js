class UI {

    constructor(cell) {
        this.cell = cell;
    }

    getUI(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    getType() {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    runRaw(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    showInput(rawText) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    delete() {
        this.cell.delete();
    }

    getState() {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

    loadState(state) {
        // Proxy for an abstract method
        throw new Error('You have to implement the method in the extended class!');
    }

}

module.exports.UI = UI;