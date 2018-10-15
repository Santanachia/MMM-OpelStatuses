"use strict"

Module.register("MMM-OpelStatuses", {
  defaults: {},
  start: function(){
    Log.info("Starting module: " + this.name);

    this.errMsg = '';

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

    this.sendSocketNotification('GET_DATA', { vehicle_key: that.config.JOBID ? that.config.JOBID : that.config.VIN })
    this.lastCHeck = new Date();
  },
  socketNotificationReceived: function (notification, payload) {
    var that = this;
    switch (notification) {
      case 'DATA':
        that.loaded = true;
        this.errMsg = "";
        that.details = payload;
        that.updateDom(that.animationSpeed);
        break;
      case 'ERR':
        console.log('error :(', payload);
        if (payload.msg === 'The vehicle cannot be found.') {
          this.errMsg = "carNotFound";
          that.updateDom(that.animationSpeed);
        }
        break;
      default:
        console.log ('wrong socketNotification', notification, payload)
        break;
    }
  },
  html: {
    table: '<table class="small"><caption align="bottom" class="xsmall">{0}</caption><thead>{1}</thead><tbody>{2}</tbody></table>',
    thead: '<tr><th>{0}</th><th colspan="2">{1}</th><th>{2}</th><th>{3}</th></tr>',
    rowL: '<tr><td rowspan="{0}">{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td></tr>',
    row: "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td></tr>",
    rowS: "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td></tr>",
  },
  getScripts: function() {
    return [
      'String.format.js',
      'moment.js'
    ];
  },
  getStyles: function() {
    return ['MMM-OpelStatuses.css'];
  },
  getDom: function () {
    var that = this;
    var wrapper = document.createElement('div');
    if (!this.config.JOBID && !this.config.VIN) {
      wrapper.innerHTML = this.translate('NoID') + ' ' + this.name + '.';
      wrapper.className = 'dimmed light small';
    }
    else if (!this.loaded) {
      wrapper.innerHTML = this.translate('Loading') + '<br />' + this.translate(this.errMsg);
      wrapper.className = 'dimmed light small';
    }
    else {
      var rows = [];
      var stages = that.fillStages(that.details);

      for (let i in stages) {
        for (let j in stages[i].statuses) {
          if (0 == j && stages[i].statuses.length > 1) {
            rows += this.html.rowL.format(
              stages[i].statuses.length,
              stages[i].stage,
              stages[i].statuses[j].status,
              stages[i].statuses[j].description,
              stages[i].statuses[j].eventCodeUpdateTimestamp,
              stages[i].statuses[j].estimatedDeliveryDateTime,
            );
          }
          else if (0 != j && stages[i].statuses.length > 1) {
            rows += this.html.rowS.format(
              stages[i].statuses[j].status,
              stages[i].statuses[j].description,
              stages[i].statuses[j].eventCodeUpdateTimestamp,
              stages[i].statuses[j].estimatedDeliveryDateTime,
            );
          }
          else {
            rows += this.html.row.format(
              stages[i].stage,
              stages[i].statuses[j].status,
              stages[i].statuses[j].description,
              stages[i].statuses[j].eventCodeUpdateTimestamp,
              stages[i].statuses[j].estimatedDeliveryDateTime,
            );
          }
        }
      }
      
      wrapper.innerHTML =
        '<span class="xsmall">' + this.details.make + ' ' + this.details.modelDescription + ' ' + this.details.modelYearSuffix + ' ' + this.details.colour + '</span>'
        + this.html.table.format(
          this.translate('Last check: ') + moment().format('YYYY-MM-DD H:mm') + this.translate(this.errMsg),
          this.html.thead.format(
            this.translate('Stage'),
            this.translate('Status'),
            this.translate('st_date_change'),
            this.translate('de_date_forecast'),
          ),
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

    var statuses = [
      { stage: this.translate('ordering'), statuses: [] },
      { stage: this.translate('set_prod'), statuses: [] },
      { stage: this.translate('production'), statuses: [] },
      { stage: this.translate('transport'), statuses: [] },
      { stage: this.translate('sale'), statuses: [] }
    ];
    
    for (let i in details.statuses) {
      switch (parseInt(details.statuses[i].lastVehicleEvent)) {
        case 20: statuses[0].statuses.push({ status: 20, description: this.translate("Acceptance_of_the_order"),                   eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 21: statuses[0].statuses.push({ status: 21, description: this.translate("Order_processing"),                          eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 25: statuses[1].statuses.push({ status: 25, description: this.translate("Setting_orders_for_production"),             eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 30: statuses[1].statuses.push({ status: 30, description: this.translate("Waiting_for_release_for_production"),        eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 32: statuses[1].statuses.push({ status: 32, description: this.translate("Release_for_production"),                    eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 33: statuses[2].statuses.push({ status: 33, description: this.translate("Production_acceptance_by_the_factory"),      eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 35: statuses[2].statuses.push({ status: 35, description: this.translate("Car_on_the_production_line"),                eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 38: statuses[2].statuses.push({ status: 38, description: this.translate("Car_made"),                                  eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 40: statuses[2].statuses.push({ status: 40, description: this.translate("Car_handed_over_for_sale"),                  eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 42: statuses[3].statuses.push({ status: 42, description: this.translate("The_car_left_the_factory_bays"),             eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 43: statuses[3].statuses.push({ status: 43, description: this.translate("Car_in_the_central_distribution_warehouse"), eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 44: statuses[3].statuses.push({ status: 44, description: this.translate("Car_sent_to_Poland"),                        eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 48: statuses[3].statuses.push({ status: 48, description: this.translate("A_car_in_a_warehouse_in_Poland"),            eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 49: statuses[3].statuses.push({ status: 49, description: this.translate("Car_sent_to_the_dealer"),                    eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 58: statuses[4].statuses.push({ status: 58, description: this.translate("The_car_reached_the_dealer"),                eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        case 60: statuses[4].statuses.push({ status: 60, description: this.translate("Sold_Car"),                                  eventCodeUpdateTimestamp: moment(details.statuses[i].eventCodeUpdateTimestamp).format('YYYY-MM-DD'), estimatedDeliveryDateTime: moment(details.statuses[i].estimatedDeliveryDateTime).format('YYYY-MM-DD') }); break;
        default: console.log(details.statuses[i]); break;
      }
    }
    statuses.reverse();

    return statuses;

  },

});
