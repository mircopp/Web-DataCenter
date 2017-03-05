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
      var data = {message: 'Data transfer successfully!', timeout: 5000};
      callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    } else {
      var data = {message: response.error, timeout: 5000};
      callbackhandler.snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }
  } else {
    throw 'Method unsupported';
  }
};
