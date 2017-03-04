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
      alert('Data transfer successfully!');
    } else {
      alert('Something went wrong!');
    }
  } else {
    throw 'Method unsupported';
  }
};
