import {autoUnsubscribe} from "./mixins.mjs";

customElements.define('input-definition', class extends autoUnsubscribe(HTMLElement) {
    static formAssociated = true;
    #definitions = new Map()
    #internals

    constructor() {
        super()
        this.#internals = this.attachInternals();
        const shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: true })
        shadowRoot.innerHTML = `
        <slot></slot>
        <div>
            <label for="type">Type</label>
            <input type="text" id="type" name="type" pattern="^\\S+$" title="A definition type must be a word or hyphenated word" required/>
            <label for="definition">Definition</label>
            <textarea id="definition" name="definition" required></textarea>
            <button>Add Definition</button>
        </div>`
    }
    
    connectedCallback() {
        super.connectedCallback?.()

        this.shadowRoot.addEventListener('input', e => e.stopImmediatePropagation())

        const addDefinition = this.shadowRoot.querySelector('button')
        const type = this.shadowRoot.querySelector('#type')
        const definition = this.shadowRoot.querySelector('#definition')

        addDefinition.addEventListener('click', e => {
            this.#set(type, definition)
            type.value = ''
            definition.value = ''
            type.focus()
        })
    }
    
    #set(type, definition) {
        if (!type.checkValidity()) {
            this.#internals.setValidity(type.validity, type.validationMessage, type);
            type.reportValidity()
            return
        }
        if (!definition.checkValidity()) {
            this.#internals.setValidity(definition.validity, definition.validationMessage, definition);
            definition.reportValidity()
            return
        }
        this.#definitions.set(type.value, definition.value)
        type.value = ''
        definition.value = ''
        this.#internals.setFormValue(JSON.stringify(Array.from(this.#definitions)))
        this.#internals.setValidity({})
        this.#render(this.#definitions)
    }

    get value() {
        return Array.from(this.#definitions)
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
        if (this.#definitions.size === 0) {
            this.#internals.setValidity({ valueMissing: true }, "Please define a definition for this card", this.shadowRoot.querySelector('#type'));
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
    
    formResetCallback() {
        this.#definitions.clear()
        this.#internals.setFormValue(null)
        this.#internals.setValidity({})
        this.replaceChildren()
    }

    #render(definitions) {
        const dictionary = document.createElement("dd");
        dictionary.innerHTML = definitions
                .entries()
                .map(([type, definition]) => `<dt>${type}</dt><dd>${definition}</dd>`)
                .toArray()
                .join('')
        this.replaceChildren(dictionary)
    }
})
