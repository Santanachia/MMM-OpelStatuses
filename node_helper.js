const request = require('request');
const NodeHelper = require('node_helper');

var details = {statuses: []};

module.exports = NodeHelper.create({
  socketNotificationReceived(notification, payload) {
    var that = this;
    
    switch(notification) {
      case 'GET_DATA':
        request('https://my.opel.pl/api/opel/pl/pl/search/vehicle/lookup_vehicle.do?vehicle_key=' + payload.vehicle_key, function (error, response, body) {

          if (error) {
            that.sendSocketNotification('ERR', { type: 'request error', msg: error });
          }

          if (response.statusCode != 200) {
            that.sendSocketNotification('ERR', { type: 'request statusCode', msg: response && response.statusCode });
          }

          if (!error & response.statusCode == 200) {
            let data;

            try {
              data = JSON.parse(body);
            } catch (e) {
              return that.sendSocketNotification('ERR', { type: 'request error', msg: error });
            }

            if (data.errorMsg) {
              return that.sendSocketNotification('ERR', { type: 'request error', msg: data.errorMsg });
            }

            details.make = data.item.vehicleDetail.make;
            details.modelDescription = data.item.vehicleDetail.modelDescription;
            details.modelYearSuffix = data.item.vehicleDetail.modelYearSuffix;
            details.vin = data.item.vehicleDetail.vin;
            details.colour = data.item.vehicleDetail.colour;

            if (!details.statuses.length || data.item.vehicleDetail.lastVehicleEvent !== details.statuses[details.statuses.length - 1].lastVehicleEvent) {
              details.statuses.push({
                lastVehicleEvent: data.item.vehicleDetail.lastVehicleEvent,
                eventCodeUpdateTimestamp: data.item.vehicleDetail.eventCodeUpdateTimestamp,
                estimatedDeliveryDateTime: data.item.vehicleDetail.estimatedDeliveryDateTime
              });
            }
            that.sendSocketNotification('DATA', details)
          }
        });
        break;
    }
  }
});
