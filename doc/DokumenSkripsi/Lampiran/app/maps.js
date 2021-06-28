const IS_LOCAL_TEST = true;
const host = IS_LOCAL_TEST ? "http://localhost:3000" : "https://kiri-app.herokuapp.com";

function initMap() {
    let map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: -6.914744, lng: 107.609810},
        zoom: 13,

    });
    return map;
}

function setMarkers(data, isStart, isEnd) {
    let locations = [];
    if (isStart) {
        data.forEach(item => {
            let startMark = {
                name: "start",
                pos: item.startCor,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            }
            locations.push(startMark)
        })
    }

    if (isEnd) {
        data.forEach(item => {
            let endMark = {name: "end", pos: item.endCor, icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"}
            locations.push(endMark)
        })
    }

    // console.log("filtered markers size" , data.length)
    let markers = locations.map((item) => {
        return new google.maps.Marker({
            position: {lat: parseFloat(item.pos.lat), lng: parseFloat(item.pos.lng)},
            icon: item.icon
        });
    });
    return markers;
}

function setHeatMap(arrData, map, isStart, isEnd) {
    let heatmapData = [];
    if (isStart) {
        arrData.forEach(item => {

            let startCoor = {location: new google.maps.LatLng(item.startCor.lat, item.startCor.lng)}
            heatmapData.push(startCoor)

        })
    }
    if (isEnd) {
        arrData.forEach(item => {
            // {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
            let endLocationObj = {location: new google.maps.LatLng(item.endCor.lat, item.endCor.lng)}
            heatmapData.push(endLocationObj)
        })
    }

    let heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        radius: 50
    });
    heatmap.setMap(map);

    return heatmap;
}

function sendRequest(url, data = {}) {
    return axios.post(url, data);
}


function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


createFilterObj = () => {
    let days = Array.from(document.getElementById("day").selectedOptions).map(option => parseInt(option.value))
    let hours = Array.from(document.getElementById("hour").selectedOptions).map(option => parseInt(option.value));
    let filter = {day: days, hour: hours};
    return filter
}


deleteMarkes = (markers) => {
    markers.forEach(item => {
        item.setMap(null)
    })
    return null
}


docReady(function () {
    let map = initMap()
    let markerCluster = null;
    let markers;
    let heatMap;

    document.getElementById("send-btn").onclick = function (e) {
        e.preventDefault();
        let filterParams = createFilterObj();
        if (filterParams.day.length <= 0) {
            console.log("fill day");
        } else if (filterParams.hour.length <= 0) {
            console.log("hour need to be filled");
        } else {
            let isMarkerCluster = document.getElementById("marker-cluster").checked
            let isHeatMap = document.getElementById("heat-map").checked
            let statusSelected = Array.from(document.getElementById("start-finish").selectedOptions).map(option => option.value)
            let statusStartChecked = statusSelected.includes("start");
            let statusEndChecked = statusSelected.includes("end")
            if (markerCluster) {
                markerCluster.removeMarkers(markers);
                markers = deleteMarkes(markers)
            }
            if (heatMap) {
                heatMap.setMap(null)
            }
            sendRequest(`${host}/searchRoute`, filterParams).then(res => {
                document.getElementById("result-length").innerHTML = res.data.data.length;
                if (isMarkerCluster) {
                    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                    let data = res.data.data;
                    if (!Array.isArray(markers)) {
                        markers = setMarkers(data, statusStartChecked, statusEndChecked)
                        markerCluster = new MarkerClusterer(map, markers, {
                            imagePath:
                                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                        });
                    }
                }
                if (isHeatMap) {
                    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                    if (!heatMap || heatMap.getMap() === null) {
                        heatMap = setHeatMap(res.data.data, map, statusStartChecked, statusEndChecked)
                    }
                }
            });
        }

    }
});

