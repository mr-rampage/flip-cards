﻿const putInCache = async (request, response) => {
    const cache = await caches.open("v1")
    await cache.put(request, response)
}

const fallbackOnCache = async (request) => {
    try {
        const responseFromNetwork = await fetch(request)
        putInCache(request, responseFromNetwork.clone())
        return responseFromNetwork
    } catch (error) {
        const responseFromCache = await caches.match(request)
        
        if (responseFromCache) {
            return responseFromCache
        }
        
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        })
    }
}

self.addEventListener("fetch", (event) => {
    event.respondWith(fallbackOnCache(event.request))
})