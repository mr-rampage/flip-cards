import {autoUnsubscribe, enableShadowRoots} from "./mixins.mjs";
import {enableSubmitOnValidInput, toKeyValue} from "./dom-utils.mjs";

customElements.define('list-builder', class extends enableShadowRoots(autoUnsubscribe(HTMLElement)) {

    connectedCallback() {
        super.connectedCallback?.()
        if (!this.shadowRoot) return
        const form = this.shadowRoot.querySelector('form')
        const submit = this.shadowRoot.querySelector('[type="submit"]')

        form.addEventListener('input', enableSubmitOnValidInput)

        form.addEventListener('submit', e => {
            e.preventDefault()
            const formData = new FormData(e.target)
            this.dispatchEvent(new CustomEvent('change', {detail: toKeyValue(formData), bubbles: true, composed: true}))
            e.currentTarget.reset()
            submit.toggleAttribute('disabled', !e.currentTarget.checkValidity())
        })
    }
})
