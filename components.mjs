function* makeCycle(items) {
    let index = 0
    while (index < items.length) {
        yield items[index]
        index++
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
 * @param {{prototype: HTMLElement; new(): HTMLElement}} base
 * @returns {{prototype: HTMLElement; new(): HTMLElement}}
 */
const autoUnsubscribe = (base) => class extends base {
    #unsubscribe = []

    constructor() {
        super();
        const original = this.addEventListener

        this.addEventListener = (type, listener, options) => {
            original.call(this, type, listener, options);
            this.#unsubscribe.push(() => this.removeEventListener(type, listener))
        }
    }

    disconnectedCallback() {
        while (this.#unsubscribe.length) {
            this.#unsubscribe.shift().call()
        }
    }
}

customElements.define('flip-deck', class extends autoUnsubscribe(HTMLElement) {
    #unsubscribe = []

    connectedCallback() {
        const cards = Array.from(this.querySelectorAll('flip-card'))
        cards.forEach(card => card.dataset.cycle = this.dataset.cycle)

        if (this.dataset.type === "random") cards.sort(() => Math.random() - 0.5);

        const cycle = makeCycle(cards)
        toggleNext(this, cycle)
        this.addEventListener('done', e => e.target.tagName.toLowerCase() === 'flip-card' && toggleNext(this, cycle))
    }
})

customElements.define('flip-card', class extends autoUnsubscribe(HTMLElement) {
    connectedCallback() {
        super.connectedCallback?.()
        const selectAllTypes = this.dataset.cycle
            .split(',')
            .map(type => type.trim())
            .map(type => `[type="${type}"]`)
            .join(',')
        const items = this.querySelectorAll(selectAllTypes)
        const cycle = makeCycle(items)
        toggleNext(this, cycle)
        this.addEventListener('click', () => toggleNext(this, cycle))
    }
})

customElements.define('flip-definition', class extends HTMLElement {
})
