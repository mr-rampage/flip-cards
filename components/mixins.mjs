export { autoUnsubscribe, enableShadowRoots }

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

