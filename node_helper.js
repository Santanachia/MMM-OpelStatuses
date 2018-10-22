const request = require('request');
const NodeHelper = require('node_helper');
const fs = require('fs');

module.exports = NodeHelper.create({

  socketNotificationReceived(notification, payload) {
    var that = this;
    
    switch(notification) {
      case 'GET_DATA':
        request('https://my.opel.pl/api/opel/pl/pl/search/vehicle/lookup_vehicle.do?vehicle_key=' + payload.vehicle_key, function (error, response, body) {

          if (error) {
            return that.sendSocketNotification('ERR', { type: 'request error', msg: error, vehicle_key: payload.vehicle_key });
          }

          if (response.statusCode != 200) {
            return that.sendSocketNotification('ERR', { type: 'request statusCode', msg: response && response.statusCode, vehicle_key: payload.vehicle_key });
          }

          if (!error & response.statusCode == 200) {
            let data;

            try {
              data = JSON.parse(body);
            } catch (e) {
              return that.sendSocketNotification('ERR', { type: 'request error', msg: error, vehicle_key: payload.vehicle_key });
            }

            if (data.errorMsg) {
              return that.sendSocketNotification('ERR', { type: 'request error', msg: data.errorMsg, vehicle_key: payload.vehicle_key });
            }

            let details = histDataRead(data.item.vehicleDetail.sono, that.path);

            details.vehicle_key = payload.vehicle_key;

            details.make = data.item.vehicleDetail.make;
            details.modelDescription = data.item.vehicleDetail.modelDescription;
            details.modelYearSuffix = (data.item.vehicleDetail.modelYearSuffix.indexOf(data.item.vehicleDetail.year) === -1 ? data.item.vehicleDetail.year : '') + data.item.vehicleDetail.modelYearSuffix;
            details.vin = data.item.vehicleDetail.vin;
            details.colour = data.item.vehicleDetail.colour;
            details.registrationDate = data.item.registrationDate;
            details.dateFirstRegistered = data.item.vehicleDetail.dateFirstRegistered;
            details.registrationMark = data.item.registrationMark;

            if (!details.statuses.length || !details.statuses.find(x => x.lastVehicleEvent == data.item.vehicleDetail.lastVehicleEvent)) {
              details.statuses.push({
                lastVehicleEvent: parseInt(data.item.vehicleDetail.lastVehicleEvent),
                eventCodeUpdateTimestamp: data.item.vehicleDetail.eventCodeUpdateTimestamp,
                estimatedDeliveryDateTime: data.item.vehicleDetail.estimatedDeliveryDateTime
              });

              histDataWrite(data.item.vehicleDetail.sono, that.path, details);
            }

            return that.sendSocketNotification('DATA', details);
          }
        });
        break;
    }
  }

});

function histDataWrite(sono, path, histData) {
  fs.writeFile(path + '/history/' + sono + '.json', JSON.stringify(histData), 'utf8', function readFileCallback(err) {
    if (err) {
      console.log(err);
    }
  });
}

function histDataRead(sono, path) {
  var histData = { statuses: [] };
  if (fs.existsSync(path + '/history/' + sono + '.json') && (histData = fs.readFileSync(path + '/history/' + sono + '.json', { encoding: 'utf8' }))) {
    histData = JSON.parse(histData);
  }
  return histData;
}
