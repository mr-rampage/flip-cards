import {autoUnsubscribe} from "./mixins.mjs";

export {reviewDeck}

const REVIEW_DECK_EVENT = "review-deck"

function reviewDeck(deck) {
    if (deck.tagName.toLowerCase() !== "flip-deck") return
    document.body.addEventListener(REVIEW_DECK_EVENT, ({target: source, detail: config}) => {
        if (source.tagName.toLowerCase() !== "flip-deck-builder") return
        const newDeck = deck.cloneNode(true)
        newDeck.dataset.tags = config.getAll("tags").join(" ")
        newDeck.dataset.definitions = config.getAll("definitions").join(" ")
        source.replaceChildren(newDeck)
    })
}

function renderOptions(name, options) {
    return Array
        .from(options)
        .map(option =>
            `<label>
                <input type="checkbox" name="${name}" value="${option}" />
                ${option}
            </label>`)
        .join('');
}

customElements.define('flip-deck-builder', class extends autoUnsubscribe(HTMLElement) {

        constructor() {
            super()
            this.attachShadow({mode: 'open'})
        }

        connectedCallback() {
            const deck = document.querySelector('flip-deck')
            const observer = new MutationObserver(() => this.parentElement.insertBefore(this, this.nextElementSibling))
            observer.observe(deck, {childList: true, subtree: true})
            const tags = new Set(
                Array.from(deck.querySelectorAll('[data-tags]'))
                    .flatMap(card => card.dataset.tags.split(' ')))

            const definitions = new Set(
                Array.from(deck.querySelectorAll('[data-type]'))
                    .flatMap(definition => definition.dataset.type))

            this.shadowRoot.innerHTML =
                `<form>
                <fieldset>
                    <legend>Tags</legend>
                    ${renderOptions("tags", tags)}
                </fieldset>
                <fieldset>
                    <legend>Definitions</legend>
                    ${renderOptions("definitions", definitions)}
                </fieldset>
                <input type="submit" value="Review Deck" />
            </form>
            <slot></slot>`

            const form = this.shadowRoot.querySelector('form')
            form.addEventListener('submit', (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                this.dispatchEvent(new CustomEvent(REVIEW_DECK_EVENT, {detail: formData, bubbles: true, composed: true}))
            })
        }
    }
)