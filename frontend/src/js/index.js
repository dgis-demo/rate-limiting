import 'bootstrap/dist/css/bootstrap-reboot.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'leaflet';
import 'leaflet.markercluster'
import '../css/map.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import {datasets} from './settings';
import {getRequest} from './requests';
import {chartSettings} from './charts';
import {setChart} from './charts';
import {map} from './map';
import {createMarkers} from './map';

let datasetButton = document.getElementById('datasetButton');
let tableButton = document.getElementById('tableButton');
let mainTable = document.getElementById('mainTable');
let allData = {}; 
let parsedDateData = {};


function parseData(json){
    let newJson = [];
    for (let i in json){
        let item = json[i];
        if (Object.keys(item).includes('date')){
            if (Object.keys(item).includes('hour')){
                item['date'] = new Date(item['date']).setHours(item['hour']);
                delete item['hour'];
            }else{
                item['date'] = new Date(item['date']).getTime();
            }
        }
        newJson.push(item);
    }
    return newJson
}

function dataToSeries(json){
    let series = [];
    let listsData = {};
    for (let key in json[0]){
        if(key !== 'date'){
            listsData[key] = [];
        }
    }
    for (let i in json){
        let item = json[i];
        for (let attibute in item){
            if(attibute !== 'date'){
                listsData[attibute].push([item['date'], item[attibute]]);
            }
        }
    }
    for (let attribute in listsData){
        series.push({'name': attribute, 'data': listsData[attribute]});
    }
    return series
}

function dropdownItemClick(e){
    let caption = e.target.innerText;
    datasetButton.getElementsByTagName('button')[0].innerText = caption;
    for (let dataset in datasets){
        if (dataset.indexOf(caption) >=0 && dataset.indexOf('hourly') >=0){
            setChart('hourlyChart', chartSettings, dataset, dataset, dataToSeries(parsedDateData[dataset]));
        }else if (dataset.indexOf(caption) >=0 && dataset.indexOf('daily') >=0){
            setChart('dailyChart', chartSettings, dataset, dataset, dataToSeries(parsedDateData[dataset]));
        }
    }
}

function clearTable(table){
    table.getElementsByTagName('thead')[0].innerHTML = ``;
    table.getElementsByTagName('tbody')[0].innerHTML = ``;
}

function fillTable(table, json){
    let head = table.getElementsByTagName('thead')[0];
    let body = table.getElementsByTagName('tbody')[0];
    let trHead = document.createElement('tr');
    trHead.innerHTML = `<th scope="col">#</th>`
    for (let key in json[0]){
        trHead.innerHTML += `<th scope="col">${key}</th>`
    }
    head.appendChild(trHead);
    for (let i in json){
        let item = json[i];
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${new Number(i)+1}</td>`
        for (let key in item){
            tr.innerHTML += `<td>${item[key]}</td>`
        }
        body.appendChild(tr);
    }
}

function tableDropdownClick(e){
    let caption = e.target.innerText;
    tableButton.getElementsByTagName('button')[0].innerText = caption;
    clearTable(mainTable);
    fillTable(mainTable, allData[caption]);
}

for(let dataset in datasets){
    getRequest(datasets[dataset])
        .then((data)=>{
            allData[dataset] = JSON.parse(JSON.stringify(data));
            parsedDateData[dataset] = parseData(data);
            if (dataset.indexOf('Poi') >= 0){
                let markers = L.markerClusterGroup();
                let circleMarkers = createMarkers(parsedDateData[dataset]);
                for (let i in circleMarkers){
                    markers.addLayer(circleMarkers[i]);
                }
                map.addLayer(markers);
            }
        })
        .catch((error)=>{
            if (error){
                window.location.href='/error';
            }
        });
}

let datasetDropdownMenu = datasetButton.getElementsByClassName('dropdown-menu')[0];
for (let dropdownItem of datasetDropdownMenu.getElementsByClassName('dropdown-item')){
    dropdownItem.addEventListener('click', dropdownItemClick);
}

let tableDropdownMenu = tableButton.getElementsByClassName('dropdown-menu')[0];
for (let dataset in datasets){
    let dropdownItem = document.createElement('div');
    dropdownItem.className = 'dropdown-item';
    dropdownItem.innerText = dataset;
    tableDropdownMenu.appendChild(dropdownItem);
    dropdownItem.addEventListener('click', tableDropdownClick);
}