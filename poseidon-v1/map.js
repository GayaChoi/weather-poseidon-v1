const API_KEY = '7d9602f96175553b6243c3e3ac9d18ed';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hvaXdvb3N1bmciLCJhIjoiY2l0Z3MwczdpMDE0MzJubzMxdHA5M2NpeSJ9.wCmxMJhXAsVFSLoPJ6QBCw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-79.4512, 43.6568], // -90 ~ 90 between
    zoom: 8.5
});

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    marker: {
        color: '#3FB1CE'
    },
    placeholder: "search",
    mapboxgl: mapboxgl
});

map.addControl(geocoder);

map.on('load', function(e) {
    getLatLng();
});

map.on('click', function(e) {
    const longitude = e.lngLat.lng;
    const latitude = e.lngLat.lat;

    const ADDRESS = "https://cors-anywhere.herokuapp.com/" +
        "https://api.openweathermap.org/data/2.5/weather?id=524901" +
        "&lat=" + latitude +
        "&lon=" + longitude +
        "&mode=JSON&units=metric&appId=" + API_KEY;

    
    fetch(ADDRESS)
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        const INFO = {
            'name': json.name,
            'temp': json.main.temp,
            'temp_max': json.main.temp_max,
            'temp_min': json.main.temp_min,
            'weather': json.weather[0].description,
            'icon': json.weather[0].icon
        };

        var popup = new mapboxgl.Popup({
                closeOnClick: false
            })
            .setLngLat([longitude, latitude])
            .setHTML(
                '<div><h1 class="widget-content-title">' + INFO.name + '</h1></div>' +
                '<img class="widget-content-img">' +
                '<div class="widget-content-info">' +
                '<ul class="widget-content-list">' +
                '<li>온도:' + INFO.temp + "°C" + '</li>' +
                '<li>최대 온도:' + INFO.temp_max + "°C" + '</li>' +
                '<li>최저 온도:' + INFO.temp_min + "°C" + '</li>' +
                '</ul>' +
                '</div>'
            ).addTo(map);

        popup._content.childNodes[2].src = "https://openweathermap.org/img/wn/" + INFO.icon + "@2x.png"; 
    })
    .catch(function(error) {
         console.log(error);
    });
}); // mapbox end

function handleGeoSuccess(position) { // 초기 위치정보를 가져오는것 에 성공 할 경우
    const marker = new mapboxgl.Marker();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;


    map.setCenter({
        lng: longitude,
        lat: latitude,
        zoom: 8.5
    });

    marker.setLngLat({
        lng: map.getCenter().lng,
        lat: map.getCenter().lat
    }).addTo(map);

    const ADDRESS = "https://cors-anywhere.herokuapp.com/" +
        "https://api.openweathermap.org/data/2.5/forecast?id=524901" +
        "&lat=" + latitude +
        "&lon=" + longitude +
        "&mode=JSON&units=metric&appId=" + API_KEY;
    
      
          fetch(ADDRESS)
          .then(function(response) { // 응답을 받으면 json 으로 반환
            return response.json();    
          })
          .then(function(json) {
             console.log(json);
             const CITY_ID = json.city.id;

            let info = [];
            let str;

            for (let index in json.list) {
                info.push({
                    'date': json.list[index].dt_txt,
                    'rain': json.list[index].rain,
                    'wind': json.list[index].wind.speed
                });
                
                
                if (info[index].hasOwnProperty("rain") === true) {
                    if (info[index].rain === undefined) {
                        info[index].rain = 0.000;
                    } else {
                       info[index].rain = info[index].rain['3h'];
                    }

                }
                   
                str = info[index].date.substring(11, 16);
                info[index].date = str;

            }

            window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
            window.myWidgetParam.push({
                id: 1,
                cityid: CITY_ID,
                appid: '50a5251236509a6a43e7a53ae4fce536',
                units: 'metric',
                containerid: 'openweathermap-widget-1'
            });

            (function() {
                var script = document.createElement('script');

                script.async = true;
                script.charset = "utf-8";
                script.src = "https://openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";

                var s = document.getElementsByTagName('script')[0];

                s.parentNode.insertBefore(script, s);

                // get chart infomation  

                Highcharts.chart('container', {
                    chart: {
                        type: 'spline'
                    },
                    title: {
                        text: 'Current Area of Precipitation and Wind Chart'
                    },
                    subtitle: {
                        text: 'Source: openweathermap.org'
                    },
                    xAxis: [{
                        title: {
                            text: 'Date'
                        },
                        categories: [
                            info[0].date,
                            info[1].date,
                            info[2].date,
                            info[3].date,
                            info[4].date,
                            info[5].date,
                            info[6].date,
                            info[7].date,
                            info[8].date,
                            info[9].date,
                            info[10].date
                        ]
                    }],
                    yAxis: [{
                        title: {
                            text: 'Precipitation'
                        },
                        labels: {
                            formatter: function() {
                                return this.value + 'mm';
                            }
                        }
                    }],
                    tooltip: {
                        crosshairs: true,
                        shared: true
                    },
                    plotOptions: {
                        spline: {
                            marker: {
                                radius: 1,
                                lineColor: '#000',
                                lineWidth: 1
                            }
                        }
                    },
                    series: [{
                        name: 'Wind',
                        line: {

                        },
                        data: [
                            info[0].wind,
                            info[1].wind,
                            info[2].wind,
                            info[3].wind,
                            info[4].wind,
                            info[5].wind,
                            info[6].wind,
                            info[7].wind,
                            info[8].wind,
                            info[9].wind,
                            info[10].wind
                        ]
                    }, {
                        name: 'Precipitation',
                        data: [
                            info[0].rain,
                            info[1].rain,
                            info[2].rain,
                            info[3].rain,
                            info[4].rain,
                            info[5].rain,
                            info[6].rain,
                            info[7].rain,
                            info[8].rain,
                            info[9].rain,
                            info[10].rain
                        ]
                    }]
                });
            })();
          })
          .catch(function(error) {
              console.log(error);
          });
} //function handleGeoSuccess end

function handleGeoError() {
    console.log("Can't access geo location");
}

function getLatLng() {
    navigator.geolocation.getCurrentPosition(handleGeoSuccess, handleGeoError);
}