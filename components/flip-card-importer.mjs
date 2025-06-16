import {autoUnsubscribe} from "./mixins.mjs";
import {toHtmlDocument} from "./dom-utils.mjs";

export {importCards}

const IMPORT_CARDS_EVENT = "import-cards"

function importCards(deck) {
    if (deck.tagName.toLowerCase() !== "flip-deck") return
    document.body.addEventListener(IMPORT_CARDS_EVENT, ({target, detail: cards}) => {
        if (target.tagName.toLowerCase() !== "flip-card-importer") return
        deck.append(...cards)
    })
}

customElements.define('flip-card-importer', class extends autoUnsubscribe(HTMLElement) {
    constructor() {
        super()
        const shadow = this.attachShadow({mode: 'open'})
        shadow.innerHTML = `
            <form>
                <label for="import">URL</label>
                <input id="import" name="import" value="" required />
                <input type="submit" value="Import" />
            </form>
        `
    }

    connectedCallback() {
        if (!this.shadowRoot) return
        const form = this.shadowRoot.querySelector('form')
        form.addEventListener('submit', e => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const url = formData.get('import').toString()
            fetch(url)
                .then(toHtmlDocument)
                .then(doc => doc.body.querySelectorAll('flip-card'))
                .then(cards =>
                    this.dispatchEvent(new CustomEvent('import-cards', {detail: cards, bubbles: true, composed: true})))
        })
        form.addEventListener('submit', e => {
            e.currentTarget.reset()
        })
    }
})
