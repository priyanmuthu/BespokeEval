const fs = require('fs')
$(document).ready(() => {
    // Do everything here
    $("#but1").click(() => {
        $("#but").hide()
        const root = fs.readdirSync('/')
        console.log(root)
    })
})