/**
 * Created by Mirco on 04.03.2017.
 */

const callbackhandler = {
  snackbarContainer: null
};

callbackhandler.init = function (snackBarContainerID) {
  callbackhandler.snackbarContainer = document.querySelector('#' + snackBarContainerID);
};

callbackhandler.createCallback = function (request, response) {
  if (request.method === 'create') {
    if ( response.status === 'success' ) {
      var data = {message: response.message, timeout: 5000};
      callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    } else {
      var data = {message: response.error, timeout: 5000};
      callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  } else {
    throw 'Method unsupported';
  }
};

callbackhandler.readHeartrateCallback = function (request, response) {
  if ( response.status === 'success' ) {
    var data = {message: response.message, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    var data = response.data;
    highchartsFunctions.createHeartratechart('heartrateContainer', data);
  } else {
    var data = {message: response.error, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  }
};

callbackhandler.readStepsCallback = function (request, response) {
  if ( response.status === 'success' ) {
    var data = {message: response.message, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    var data = response.data;
    highchartsFunctions.createStepchart('stepsContainer', data);
  } else {
    var data = {message: response.error, timeout: 5000};
    callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
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
