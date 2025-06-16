export {
    toHtmlDocument,
    createElementFromString
}

const toHtmlDocument = async (response) => {
    const text = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(text, 'text/html')
}

function createElementFromString(htmlString) {
    const template = document.createElement('template')
    template.innerHTML = htmlString
    return template.content.cloneNode(true)
}