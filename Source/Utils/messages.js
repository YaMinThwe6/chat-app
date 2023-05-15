const generateMessages = (text, username) => {
    return {
        text,
        username,
        time: new Date().getTime()
    }
}

module.exports = {
    generateMessages
}
