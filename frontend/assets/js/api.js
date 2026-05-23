async function reverseGeocode(lat, lng) {
    const url = `${API_URL}/reverse-geocode?lat=${lat}&lng=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function predictLandPrice(payload) {

    const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(payload)
    });

    return await response.json();
}