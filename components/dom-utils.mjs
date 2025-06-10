export {
    toHtmlDocument,
    enableSubmitOnValidInput,
    toJson,
    createElementFromString
}

const toHtmlDocument = async (response) => {
    const text = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(text, 'text/html')
}

const enableSubmitOnValidInput = e => {
    const submit = e.currentTarget.querySelector('[type="submit"]')
    submit.toggleAttribute('disabled', !e.currentTarget.checkValidity())
}

const toJson = formData =>
    Array.from(formData.entries()).reduce((json, [key, value]) => ({...json, [key]: value.trim()}), {})

function createElementFromString(htmlString) {
    const template = document.createElement('template')
    template.innerHTML = htmlString
    return template.content.cloneNode(true)
}