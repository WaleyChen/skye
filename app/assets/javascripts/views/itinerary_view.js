MoustacheBurrito.ItineraryView = Backbone.View.extend({

  className: 'itinerary',

  initialize: function(settings) {
    this.tasks = settings.tasks;
    this.start = settings.start;
    this.end = settings.end;
    this.scheduleView = settings.scheduleView;
    this.secPerPixel = MoustacheBurrito.secPerPixel;

    var that = this;
    $('.itinerary-wrapper').scroll(function() {
      that.onScroll();
    })
  },

  render: function() {
    this.$el.html('');
    this.$el.css({
      height: this.timeToScrollTop(this.end)
    });

    _.each(this.tasks, function(task) {
      var view = new MoustacheBurrito.ItineraryTaskView({task: task, itineraryView: this});
      view.render();
      this.$el.append(view.el);
    }, this);

    var that = this;
    $('.itinerary-wrapper').scroll(function() { that.onScroll(); });

  },

  scrollToTime: function(time) {
    this.$el.parent().animate({scrollTop: this.timeToScrollTop(time)});
  },

  onScroll: function() {
    this.scheduleView.calendarView.activeDay(this.scrollTopTotime(this.$el.parent().scrollTop()));
  },

  timeToScrollTop: function(time) {
    return (time - this.start) / this.secPerPixel;
  },

  scrollTopTotime: function(scrollTop) {
    return scrollTop * this.secPerPixel + this.start;
  }

});