/**
 * @typedef { HTMLElement & { connectedCallback: () => void; disconnectedCallback: () => void }} CustomElement
 */
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

const hideAll = (root) => Array.from(root.children)
    .forEach(child => child.style.display = "none")

const toggleNext = (root, cycler) => {
    hideAll(root)
    const next = cycler.next()
    if (next.done) {
        root.dispatchEvent(new CustomEvent('done', {bubbles: true, composed: true}))
    } else {
        next.value.style.display = 'block'
    }
}

/**
 * Mixin that auto-unsubscribes to event listeners when component is removed from the DOM
 * @param {{prototype: HTMLElement; new(): HTMLElement }} base
 * @returns {{prototype: CustomElement; new(): CustomElement }}
 */
const autoUnsubscribe = (base) => class extends base {
    #unsubscribe = []

    constructor() {
        super()
        const original = this.addEventListener

        this.addEventListener = (type, listener, options) => {
            original.call(this, type, listener, options)
            this.#unsubscribe.push(() => this.removeEventListener(type, listener))
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback?.()
        while (this.#unsubscribe.length) {
            this.#unsubscribe.shift().call()
        }
    }
}

/**
 *
 * @param {{prototype: HTMLElement; new(): HTMLElement }} base
 * @returns {{prototype: CustomElement; new(): CustomElement }}
 */
const enableShadowRoots = base => class extends base {
    constructor() {
        super()

        const patchDeclarativeTemplate = template => {
            const mode = template.getAttribute("shadowrootmode")
            const shadowRoot = this.attachShadow({mode})
            shadowRoot.appendChild(template.content)
            template.remove()
        }

        this.querySelectorAll("template[shadowrootmode]").forEach(patchDeclarativeTemplate)
    }
}

function respondDataset(element) {
    element.addEventListener('request-dataset', e => e.detail.value = element.dataset[e.detail.name])
}

function requestDataset(element, name) {
    let request = new CustomEvent('request-dataset', {detail: {name, value: null}, bubbles: true, composed: true})
    element.dispatchEvent(request)
    return request.detail.value
}

const requestDeckCycle = (element) => requestDataset(element, 'definitions').split(',').map(item => item.trim())

const handleEventByTagName = (tagName, f) => (e) =>
    e.target.tagName.toLowerCase() === tagName && f(e)

customElements.define('flip-deck', class extends autoUnsubscribe(HTMLElement) {
    connectedCallback() {
        const tags = this.dataset.tags.split(',').map(item => item.trim())
        const byTags = card => tags.some(tag => card.dataset.tags.toLowerCase().includes(tag.toLowerCase()))
        const cycle = filter(cycleByTagName(this, 'flip-card'), byTags)
        toggleNext(this, cycle)
        this.addEventListener('done', handleEventByTagName('flip-card', () => toggleNext(this, cycle)))
        respondDataset(this, 'cycle')
    }
})


customElements.define('flip-card', class extends autoUnsubscribe(HTMLElement) {
    connectedCallback() {
        super.connectedCallback?.()
        const definitionTypes = requestDeckCycle(this)
        let byDefinitionType = definition => definitionTypes.includes(definition.dataset.type);
        const definitions = filter(cycleByTagName(this, 'flip-definition'), byDefinitionType)
        toggleNext(this, definitions)
        this.addEventListener('click', handleEventByTagName('flip-definition', () => toggleNext(this, definitions)))
    }
})

customElements.define('flip-definition', class extends HTMLElement {
})

const enableSubmitOnValidInput = submit => e =>
    submit.toggleAttribute('disabled', !e.currentTarget.checkValidity())

const toJson = formData =>
    Array.from(formData.entries()).reduce((json, [key, value]) => ({...json, [key]: value.trim()}), {})

customElements.define('list-builder', class extends enableShadowRoots(autoUnsubscribe(HTMLElement)) {
    #value = []

    connectedCallback() {
        super.connectedCallback?.()
        if (!this.shadowRoot) return
        const form = this.shadowRoot.querySelector('form')
        const submit = this.shadowRoot.querySelector('[type="submit"]')

        form.addEventListener('input', enableSubmitOnValidInput(submit))

        form.addEventListener('submit', e => {
            e.preventDefault()
            const formData = new FormData(e.target)
            this.#value.push(toJson(formData))
            this.dispatchEvent(new CustomEvent('change', {detail: this.#value, bubbles: true, composed: true}))
            e.currentTarget.reset()
            submit.toggleAttribute('disabled', !e.currentTarget.checkValidity())
        })
    }
})

customElements.define('flip-card-builder', class extends autoUnsubscribe(HTMLElement) {
    #tags = []
    #definitions = []

    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
                <h1>Card Builder</h1>
                <fieldset class="tags">
                  <legend>Tags</legend>
                  <ul></ul>
                  <list-builder>
                    <template shadowrootmode="open">
                        <form>
                            <label for="tag">Tag</label>
                            <input type="text" id="tag" name="tag" required/>
                            <input type="submit" value="Add tag" disabled/>
                        </form>
                    </template>
                  </list-builder>
                </fieldset>
                <fieldset class="definitions">
                  <legend>Definitions</legend>
                  <ul></ul>
                  <list-builder>
                    <template shadowrootmode="open">
                        <form>
                            <label for="type">Type</label>
                            <input type="text" id="type" name="type" required/>
                            <label for="definition">Definition</label>
                            <textarea id="definition" name="definition" required></textarea>
                            <input type="submit" value="Add definition" disabled/>
                        </form>
                    </template>
                  </list-builder>
                </fieldset>
                <input type="submit" value="Create card" />
            </form>
        `
    }

    connectedCallback() {
        super.connectedCallback?.()

        const listBuilderEvent = f => e => {
            if (e.target.tagName.toLowerCase() !== 'list-builder') return
            f(e)
        }

        this.shadowRoot
            .querySelector('fieldset.tags')
            .addEventListener('change', listBuilderEvent(e => {
                this.#updateItems(e.currentTarget, result => `<li>${result.tag}</li>`, e.detail)
                this.#tags = e.detail
            }))

        this.shadowRoot
            .querySelector('fieldset.definitions')
            .addEventListener('change', listBuilderEvent(e => {
                this.#updateItems(e.currentTarget, result => `<li>${result.type},${result.definition}</li>`, e.detail)
                this.#definitions = e.detail
            }))

        this.shadowRoot
            .querySelector('form')
            .addEventListener('submit', e => {
                e.preventDefault()
                if (this.#tags.length && this.#definitions.length) {
                    const template = document.createElement('template')
                    template.innerHTML = this.card
                    this.dispatchEvent(new CustomEvent('input', {detail: template, bubbles: true, composed: true}))
                }
            })
    }

    get card() {
        return `
            <flip-card data-tags="${this.#tags.map(this.#renderTag).join(',')}">
                ${this.#definitions.map(this.#renderDefinition).join('\n')}
            </flip-card>
        `.trim()
    }

    #renderTag({tag}) {
        return tag
    }

    #renderDefinition({type, definition}) {
        return `<flip-definition data-type="${type}">${definition}</flip-definition>`
    }

    #updateItems(fieldSet, toListItem, results) {
        const list = fieldSet.querySelector('ul')
        if (!list) return
        list.innerHTML = results.map(toListItem).join('')
    }
})