import {autoUnsubscribe} from "./mixins.mjs";
import "./list-builder.mjs"

customElements.define('flip-card-builder', class extends autoUnsubscribe(HTMLElement) {
    #tags = []
    #definitions = []

    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
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
                this.#tags.push(e.detail)
                this.#updateItems(e.currentTarget, result => `<li>${result.tag}</li>`, this.#tags)
            }))

        this.shadowRoot
            .querySelector('fieldset.definitions')
            .addEventListener('change', listBuilderEvent(e => {
                this.#definitions.push(e.detail)
                this.#updateItems(e.currentTarget, result => `<li>${result.type},${result.definition}</li>`, this.#definitions)
            }))

        this.shadowRoot
            .querySelector('form')
            .addEventListener('submit', e => {
                e.preventDefault()
                if (this.#tags.length && this.#definitions.length) {
                    const template = document.createElement('template')
                    template.innerHTML = this.card
                    this.dispatchEvent(new CustomEvent('input', {detail: template, bubbles: true, composed: true}))
                    this.#reset()
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
    
    #reset() {
        this.#tags = []
        this.#definitions = []
        this.shadowRoot.querySelectorAll('ul').forEach(list => list.replaceChildren())
    }
})
