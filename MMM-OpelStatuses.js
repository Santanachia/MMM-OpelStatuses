"use strict"

Module.register("MMM-OpelStatuses", {
  defaults: {},
  start: function(){
    Log.info("Starting module: " + this.name);

    // load data
    this.load();

    // schedule refresh
    setInterval(
      this.load.bind(this),
      15 * 60 * 1000
    );
  },
  load: function(){
    var that = this;

    this.sendSocketNotification('GET_DATA', { vehicle_key: that.config.JOBID ? that.config.JOBID : that.config.VIN})

  },
  socketNotificationReceived: function (notification, payload) {
    var that = this;
    switch (notification) {
      case 'DATA':
        that.loaded = true;
        that.details = payload;
        that.updateDom(that.animationSpeed);
        break;
      case 'ERR':
        console.log('error :(', payload)
        break;
      default:
        console.log ('wrong socketNotification', notification, payload)
        break;
    }
  },
  html: {
    table: '<table class="small"><caption class="xsmall">{0}</caption><thead><tr><th>Etap</th><th colspan="2">Status</th><th>data zmiany<br>statusu</th><th>prognozowana<br>data dostawy</th></tr></thead><tbody>{1}</tbody></table>',
    row: "<tr><td{0}>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td></tr>",
  },
  getScripts: function() {
    return ['String.format.js'];
  },
  getStyles: function() {
    return ['MMM-OpelStatuses.css'];
  },
  getDom: function () {
    var that = this;
    var wrapper = document.createElement('div');
    if (!this.config.JOBID && !!this.config.VIN) {
      wrapper.innerHTML = this.translate('NoID') + this.name + '.';
      wrapper.className = 'dimmed light small';
    }
    else if (!this.loaded) {
      wrapper.innerHTML = this.translate('Loading');
      wrapper.className = 'dimmed light small';
    }
    else {
      var rows = [];
      var stages = that.fillStages(that.details);

      for (var i in stages) {
        for (var j in stages[i].statuses) {
          rows.push(this.html.row.format(
            0 === j && stages[i].statuses.length > 0 ? ' rowspan="' + stages[i].statuses.length + '"' : '',
            stages[i].stage,
            stages[i].statuses[j].status,
            stages[i].statuses[j].description,
            stages[i].statuses[j].eventCodeUpdateTimestamp,
            stages[i].statuses[j].estimatedDeliveryDateTime,
          ));
        }
      }

      wrapper.innerHTML = this.html.table.format(
        this.config.JOBID ? 'JOBID: ' + this.config.JOBID : 'VIN: ' + this.config.VIN,
        rows
      )
    }
    return wrapper;
  },
  getTranslations: function() {
    return {
      en: 'translations/en.json',
      pl: 'translations/pl.json'
    }
  },
  fillStages: function (details) {
    var that = this;

    var statuses = [
      { stage: 'Zamawianie', statuses: [] },
      { stage: 'Ustawianie produkcji', statuses: [] },
      { stage: 'Produkcja', statuses: [] },
      { stage: 'Transport', statuses: [] },
      { stage: 'Sprzedaż', statuses: [] }
    ];
    
    for(var i in details.statuses) {
      switch (parseInt(details.statuses[i].lastVehicleEvent)) {
        case 20:
          statuses[0].statuses.push({ status: 20, description: 'Przyjęcie zamówienia', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 21:
          statuses[0].statuses.push({ status: 21, description: 'Przetwarzanie zamówienia', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 25:
          statuses[1].statuses.push({ status: 25, description: 'Ustawianie zamówienia do produkcji', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 30:
          statuses[1].statuses.push({ status: 30, description: 'Oczekiwanie na zwolnienie do produkcji', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 32:
          statuses[1].statuses.push({ status: 32, description: 'Zwolnienie do produkcji', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 33:
          statuses[2].statuses.push({ status: 33, description: 'Przyjęcie do produkcji przez fabrykę', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 35:
          statuses[2].statuses.push({ status: 35, description: 'Samochód na linii produkcyjnej', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 38:
          statuses[2].statuses.push({ status: 38, description: 'Samochód wyprodukowany', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 40:
          statuses[2].statuses.push({ status: 40, description: 'Samochód przekazany do sprzedarzy', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 42:
          statuses[3].statuses.push({ status: 42, description: 'Samochód opuścił bamy fabryki', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 43:
          statuses[3].statuses.push({ status: 43, description: 'Samochód na centralnym składzie dystrybucyjnym', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 44:
          statuses[3].statuses.push({ status: 44, description: 'Samochód wysłany do Polski', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 48:
          statuses[3].statuses.push({ status: 48, description: 'Samochód na składzie w Polsce', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 49:
          statuses[3].statuses.push({ status: 49, description: 'Samochód wysłany do dealera', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 58:
          statuses[4].statuses.push({ status: 58, description: 'Samochód dojechał do dealera', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        case 60:
          statuses[4].statuses.push({ status: 60, description: 'Samochód sprzedany', eventCodeUpdateTimestamp: that.prettyDate(details.statuses[i].eventCodeUpdateTimestamp), estimatedDeliveryDateTime: that.prettyDate(details.statuses[i].estimatedDeliveryDateTime) });
          break;
        default:
          console.log(details.statuses[i]);
          break;
      }
    }
    statuses.reverse();

    return statuses;

  },
  prettyDate: function (dateString) {
    if(!dateString) { return null }
    var date = new Date(dateString);
    var d = date.getDate();
    if(d < 10) d = '0' + d;
    var m = date.getMonth() + 1;
    if(m < 10) m = '0' + m;
    var y = date.getFullYear();

    return y + '-' + m + '-' + d;
  }

});
