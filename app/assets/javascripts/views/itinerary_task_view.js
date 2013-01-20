MoustacheBurrito.ItineraryTaskView = Backbone.View.extend({

  className: 'itinerary-task',

  initialize: function(settings) {
    this.task = settings.task;
    this.itineraryView = settings.itineraryView;
  },

  render: function() {
    this.$el.html(this.task.name);
    this.$el.css({
      top: this.itineraryView.timeToScrollTop(this.task.scheduledStart),
      height: this.task.duration / this.itineraryView.secPerPixel
    })
  }
});