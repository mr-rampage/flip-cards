export { toggleNext, cycleByTagName, filter, toHtmlDocument, enableSubmitOnValidInput, toJson, handleEventByTagName, respondDataset, requestDataset }

function* cycleByTagName(root, tagName) {
    const elements = root.getElementsByTagName(tagName)
    for (const element of elements) {
        yield element
    }
}

function* filter(iterator, predicate) {
    for (const element of iterator) {
        if (predicate(element)) {
            yield element
        }
    }
}

function hideAll(root) {
    return Array.from(root.children).forEach(child => child.style.display = "none")
}

function toggleNext(root, cycler) {
    hideAll(root)
    const next = cycler.next()
    if (next.done) {
        root.dispatchEvent(new CustomEvent('done', {bubbles: true, composed: true}))
    } else {
        next.value.style.display = 'block'
    }
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

const handleEventByTagName = (tagName, f) => (e) =>
    e.target.tagName.toLowerCase() === tagName && f(e)

function respondDataset(element) {
    element.addEventListener('request-dataset', e => e.detail.value = element.dataset[e.detail.name])
}

function requestDataset(element, name) {
    let request = new CustomEvent('request-dataset', {detail: {name, value: null}, bubbles: true, composed: true})
    element.dispatchEvent(request)
    return request.detail.value
}
