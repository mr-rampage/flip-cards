import "./components/index.mjs"
import {importCards} from "./components/flip-card-importer.mjs";
import {addCardToDeck} from "./components/flip-card-builder.mjs";
import {reviewDeck} from "./components/flip-deck-builder.mjs";

const navigator = globalThis.navigator;

// Register the service worker
if ('serviceWorker' in navigator) {
    // Try to register the service worker.
    try {
        // Capture the registration for later use, if needed
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        document.body.querySelector('#status-offline').textContent += '😎'
    } catch (err) {
        document.body.querySelector('#status-offline').textContent += '😵'
    }
}


if (navigator.storage?.persist) {
    navigator.storage.persist().then((persistent) => {
        if (persistent) {
            document.body.querySelector('#status-persistence').textContent += '😎'
        } else {
            document.body.querySelector('#status-persistence').textContent += '😵'
        }
    });
}

const deck = document.body.querySelector('flip-deck')

const observer = new MutationObserver(() => localStorage.setItem("deck", deck.innerHTML))
observer.observe(deck, {childList: true, subtree: true})
deck.innerHTML = localStorage.getItem("deck") ?? ""

addCardToDeck(deck)
importCards(deck)
reviewDeck(deck)