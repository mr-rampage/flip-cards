import {autoUnsubscribe} from "./mixins.mjs";
import {toHtmlDocument, enableSubmitOnValidInput} from "./dom-utils.mjs";

customElements.define('flip-card-importer', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
                <label for="import">URL</label>
                <input id="import" name="import" value="" required />
                <input type="submit" value="Import" disabled/>
            </form>
        `
    }

    connectedCallback() {
        if (!this.shadowRoot) return
        const form = this.shadowRoot.querySelector('form')
        form.addEventListener('input', enableSubmitOnValidInput)
        form.addEventListener('submit', e => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const url = formData.get('import').toString()
            fetch(url)
                .then(toHtmlDocument)
                .then(doc => doc.body.querySelectorAll('flip-card'))
                .then(cards => document.body.querySelector('flip-deck')?.append(...cards))
                .then(() => {
                    // TODO: There's probably a better way to do this, but trying to trigger connectedCallback of the deck
                    const deck = document.body.querySelector('flip-deck')
                    deck.parentElement.insertBefore(deck, deck.nextSibling);
                })
        })
        form.addEventListener('submit', e => {
            e.currentTarget.reset()
        })
    }
})
