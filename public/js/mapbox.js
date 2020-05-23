/* eslint-disable */


export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiaHdwLXNhbWEiLCJhIjoiY2thZjVtcmduMDJ5dDJxbXVsdHo2ZTE4ZyJ9.gbJl3dMdQuRhxO2p2q4MFw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/hwp-sama/ckaf5ztuz208v1ipnccdl7zud',
        scrollZoom: false,
        zoom: 4,
    });
    //interactive : false //can't scroll
    //coordinate: [lng,lat]
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        //create marker
        const el = document.createElement('div');
        el.className = 'marker';

        //add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(loc.coordinates)
            .addTo(map);
        //add popup

        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);
        //extend map bound
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};
