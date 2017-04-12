/**
 * Created by Mirco on 04.03.2017.
 */

const callbackhandler = {
  snackbarContainer : null,
  dataObjects : {}
};

callbackhandler.init = function (crossDomainDataStorageClient, snackBarContainerID) {
  callbackhandler.snackbarContainer = document.querySelector('#' + snackBarContainerID);
  callbackhandler.crossDomainDataStorageClient = crossDomainDataStorageClient;
};

callbackhandler.createCallback = function (request, response) {
  if (request.method === 'create') {
    var data = {message: response.message, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  } else {
    throw 'Method unsupported';
  }
};
callbackhandler.deleteCallback = function (request, response) {
  if (request.method === 'delete') {
    var data = {message: response.message, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  } else {
    throw 'Method unsupported';
  }
};

callbackhandler.updateCallback = function (request, response) {
  if (request.method === 'update') {
    var data = {message: response.message, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  } else {
    throw 'Method unsupported';
  }
};

callbackhandler.readHeartrateCallback = function (request, response) {
  if ( response.status === 'success' ) {
    callbackhandler.dataObjects.heartrate = response.data;
    if ( response.data.length > 0 ) {
      utils.insertDataObjectTable('heartrateObjectContainer', Object.keys(response.data[0].values));
      for ( var i = 0; i < response.data.length; i++ ) {
        utils.insertObjectTableCell('heartrateObjectContainer', 'heartrate', response.data[i].timestamp, response.data[i].values, response.data[i], i);
      }
      utils.setClickHandler(response, 'heartrate');
    } else {
      document.querySelector('#heartrateObjectContainer').innerHTML = '<h5>No Data available!</h5>';
    }

      var data = response.data;
      highchartsFunctions.createHeartratechart('heartrateContainer', data);
  }
  var message = {message: response.message, timeout: 5000};
  callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(message);
};

callbackhandler.readStepsCallback = function (request, response) {
  callbackhandler.dataObjects.heartrate = response.data;
  if ( response.data.length > 0 ) {
    utils.insertDataObjectTable('stepsObjectContainer', Object.keys(response.data[0].values));
    for ( var i = 0; i < response.data.length; i++ ) {
      utils.insertObjectTableCell('stepsObjectContainer', 'steps', response.data[i].timestamp, response.data[i].values, response.data[i], i);
    }
    utils.setClickHandler(response, 'steps');
  } else {
    document.querySelector('#stepsObjectContainer').innerHTML = '<h5>No Data available!</h5>';
  }
  var data = {message: response.message, timeout: 5000};
  callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  if ( response.status === 'success' ) {
    var data = response.data;
    highchartsFunctions.createStepchart('stepsContainer', data);
  }
};



function contains(array, object) {
  for ( let i = 0; i < array.length; i++) {
    if (array[i] == object) {
      return true;
    }
  }
  return false;
};

var highchartsFunctions = {

};

highchartsFunctions.createLineSeries = function (data) {
  var clusters = {};
  for ( var i = 0; i < data.length; i++) {
    var keys = Object.keys(clusters);
    var currentDataPoint = data[i];
    var currentDay = currentDataPoint.timestamp.split('T')[0];
    if (contains(keys, currentDay)) {
      clusters[currentDay].push([Date.parse(currentDataPoint.timestamp)-Date.parse(currentDay), currentDataPoint.values.val]);
    } else {
      clusters[currentDay] = [[Date.parse(currentDataPoint.timestamp)-Date.parse(currentDay), currentDataPoint.values.val]]
    }
  }
  var res = [];
  var keys = Object.keys(clusters);
  for ( let i = 0; i < keys.length; i++ ) {
    res.push({name : keys[i], data : clusters[keys[i]]});
  }
  return res;
};

highchartsFunctions.createHeartratechart = function (htmlId, data) {
  var series = highchartsFunctions.createLineSeries(data);
  Highcharts.chart(htmlId, {
      chart: {
          type : 'spline'
      },
      title: {
          text: 'Your heartrate by days',
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          second: '%H:%M:%S'
        },
        title: {
          text: 'Timestamp'
        }
      },
      yAxis: {
          title: {
              text: 'Heartrate (bpm)'
          },
      },
      tooltip: {
          valueSuffix: 'bpm'
      },

      series: series
  });
};

highchartsFunctions.createStepchart = function (htmlId, data) {
  var series = highchartsFunctions.createLineSeries(data);
  Highcharts.chart(htmlId, {
      chart: {
          type : 'spline'
      },
      title: {
          text: 'Your step data over days',
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          second: '%H:%M:%S'
        },
        title: {
          text: 'Timestamp'
        }
      },
      yAxis: {
          title: {
              text: 'Steps'
          },
      },
      series: series
  });
};

var utils = {

};

utils.insertDataObjectTable = function (containerID, cells) {
  var cellString = '';
  for ( var i = 0; i < cells.length; i++ ) {
    cellString += '<th class="mdl-data-table__cell--non-numeric">' + cells[i] + '</th>';
  }
  var htmlCode = '<table class="mdl-data-table mdl-js-data-table" style="width: 100%;"> ' +
    '<thead> ' +
    '<tr> ' +
    '<th class="mdl-data-table__cell--non-numeric">Timestamp</th> ' +
    cellString +
    '</tr> ' +
    '</thead> ' +
    '<tbody> ' +
    '</tbody> ' +
    '</table>';
  document.querySelector('#' + containerID).innerHTML = htmlCode;
};

utils.insertObjectTableCell = function (containerID, type, timestamp, values, dataObject,id) {
  var valueString = '';
  var keys = Object.keys(values);
  for ( var i = 0; i < keys.length; i++ ) {
    let form = '<form action="#"> ' +
      '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"> ' +
      '<input value="' + values[keys[i]] + '" class="mdl-textfield__input" type="text" pattern="-?[0-9]*(\.[0-9]+)?" id="' + type + 'Update|' + id + '|' + keys[i] + '"> ' +
      '<label class="mdl-textfield__label" for="' + type + 'Update|' + id + '|' + i +'"></label> ' +
      '</div> ' +
      '</form>';
    valueString += '<td class="mdl-data-table__cell--non-numeric">' + form + '</td>';
  }
  var buttonString = '<td class="mdl-data-table__cell--non-numeric">' +
    '<button id="' + type + 'UpdateButton|' + id + '" class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent">' +
    'Update value' +
    '</button>' +
    '</td>';
  var htmlCode = ' <tr id="' + type + 'Cell|' + id + '"> ' +
    '<td class="mdl-data-table__cell--non-numeric">' + timestamp + '</td> ' +
    valueString +
    buttonString +
    '</tr>';
  document.querySelector('#' + containerID + ' tbody').innerHTML += htmlCode;
};

utils.setClickHandler = function (response, type) {
  for ( var z = 0; z < response.data.length; z++ ) {
      document.getElementById(type + 'UpdateButton|' + z).onclick = function (e) {
        var id_token = localStorage.getItem('id_token');
        var id = this.id.split('|')[1];
        var timestamp = document.getElementById(type + 'Cell|' + id).querySelector('td').innerHTML;
        var oldDataObject;
        for ( var j = 0; j < callbackhandler.dataObjects.heartrate.length; j++ ) {
          if ( callbackhandler.dataObjects.heartrate[j].timestamp === timestamp) {
            oldDataObject = callbackhandler.dataObjects.heartrate[j];
          }
        }
        var newDataObject = jQuery.extend(true, {}, oldDataObject);
        var valueKeys = Object.keys(newDataObject.values);
        for ( var i = 0; i < valueKeys.length; i++ ) {
          let key = valueKeys[i];
          newDataObject.values[valueKeys[i]] = parseInt(document.getElementById(type + 'Update|' + id + '|' + key).value);
        }
        callbackhandler.crossDomainDataStorageClient.sendUpdateRequest(id_token, oldDataObject, newDataObject, callbackhandler.updateCallback);
      };
    }
};
