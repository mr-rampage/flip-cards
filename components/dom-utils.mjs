export {
    toHtmlDocument,
    enableSubmitOnValidInput,
    toKeyValue,
    createElementFromString,
    disableSubmitOnFormChange
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

const disableSubmitOnFormChange = (form) => {
    const submit = form.querySelector('[type="submit"]');
    if (!submit) return
    const toggleDisabled = () => submit.toggleAttribute('disabled', !form.checkValidity());
    form.addEventListener("input", toggleDisabled)
    form.addEventListener("change", toggleDisabled)
}

const toKeyValue = formData =>
    Array.from(formData.keys())
        .map(key => [key, formData.get(key)])
        .reduce((acc, [key, values]) => ({...acc, [key]: values}), {})

function createElementFromString(htmlString) {
    const template = document.createElement('template')
    template.innerHTML = htmlString
    return template.content.cloneNode(true)
}