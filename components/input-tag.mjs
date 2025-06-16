import {autoUnsubscribe} from "./mixins.mjs";

customElements.define('input-tag', class extends autoUnsubscribe(HTMLElement) {
    static formAssociated = true;
    #tags = new Set()
    #internals

    constructor() {
        super()
        this.#internals = this.attachInternals();
        const shadowRoot = this.attachShadow({mode: 'open', delegatesFocus: true})
        shadowRoot.innerHTML = `
        <slot></slot>
        <div>
            <label for="tag">Tag</label>
            <input type="text" id="tag" name="tag" pattern="^\\S+$" title="A tag must be a word or hyphenated word" required/>
            <button>Add Tag</button>
        </div>`
    }

    connectedCallback() {
        super.connectedCallback?.()
        this.shadowRoot.addEventListener('input', e => e.stopImmediatePropagation())
        const tag = this.shadowRoot.querySelector('#tag')
        const addTag = this.shadowRoot.querySelector('button')
        addTag.addEventListener('click', e => {
            this.#add(tag)
            tag.value = ''
            tag.focus()
        })
    }

    get value() {
        return Array.from(this.#tags)
    }

    get form() {
        return this.#internals.form;
    }

    get name() {
        return this.getAttribute('name');
    }

    get type() {
        return this.localName;
    }

    checkValidity() {
        if (this.#tags.size === 0) {
            this.#internals.setValidity({ valueMissing: true }, "Please define a tag", this.shadowRoot.querySelector('#tag'));
        }
        return this.#internals.checkValidity();
    }

    reportValidity() {
        return this.#internals.reportValidity();
    }

    get validity() {
        return this.#internals.validity;
    }

    get willValidate() {
        return this.#internals.willValidate;
    }

    get validationMessage() {
        return this.#internals.validationMessage;
    }

    #add(input) {
        if (!input.checkValidity()) {
            this.#internals.setValidity(input.validity, input.validationMessage, input);
            input.reportValidity()
            return
        }
        this.#tags.add(input.value)
        this.#internals.setFormValue(JSON.stringify(Array.from(this.#tags)))
        this.#internals.setValidity({})
        this.#render(this.#tags)
    }

    #render(tags) {
        const list = document.createElement('ul')
        list.innerHTML = Array.from(tags)
            .map(tag => `<li>${tag}</li>`)
            .join('')
        this.replaceChildren(list)
    }
})