import {autoUnsubscribe} from "./mixins.mjs";
import {requestDeckCycle} from "./flip-deck.mjs";
import {cycleByTagName, filter, handleEventByTagName, toggleNext} from "./dom-utils.mjs";

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

