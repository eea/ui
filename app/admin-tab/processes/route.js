import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    showRunning: {
      refreshModel: true
    },
    resourceId: {
      refreshModel: true
    },
    resourceType: {
      refreshModel: true
    },
    processName: {
      refreshModel: true
    }
  },
  intervalId: null,
  redirect: function() {
    this.transitionTo('admin-tab.processes.index', {
      queryParams: this.paramsFor('admin-tab.processes')
    });
  },
  model: function(params) {
    return this.store.find('processinstance', null, this.parseParams(params)).then((response) => {
      var resourceTypes = this.get('store').all('schema').filterBy('links.collection').map((x) => { return x.get('_id'); });
      return Ember.Object.create({
        processInstance: response,
        resourceTypes: resourceTypes
      });
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model); // restore the defaults as well
    const intervalCount = 2000;
    if (!this.get('intervalId')) {
      this.set('intervalId',
        setInterval(() => {
          var params = this.paramsFor('admin-tab.processes');
          this.store.find('processinstance', null, this.parseParams(params)).then((response) => {
            this.controller.get('model.processInstance').replaceWith(response);
          }, ( /*error*/ ) => {});
        }, intervalCount));
    }
  },
  deactivate: function() {
    clearInterval(this.get('intervalId'));
  },
  parseParams: function(params) {
    var returnValue = {
      filter: {
      },
      limit: 100,
      sortBy: 'id',
      sortOrder: 'desc',
      depaginate: false,
      forceReload: true
    };
    if (params) {
      _.forEach(params, (item, key) => {
        if (item) {
          if (key === 'showRunning') {
            returnValue.filter.endTime_null = true;
          } else {
            returnValue.filter[key] = item;
          }
        } else {
          delete returnValue.filter[key];
        }
      });
    }
    return returnValue;
  }
});
