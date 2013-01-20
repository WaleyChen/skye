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

    this.renderTasks(this.tasks);
    this.renderLabels();

    $('.itinerary-wrapper').scroll(this.onScroll.bind(this));

  },

  renderLabels: function() {

    for (var day = this.start; day < this.end; day += MoustacheBurrito.time.days(1)) {
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var date = MoustacheBurrito.time.toDate(day);
      var $label = $("<div class='day-label'>" + months[date.getMonth()] + " " + date.getDate() + "</div>");
      $label.css({top: this.timeToScrollTop(day)});
      this.$el.append($label);
    }

  },

  renderTasks: function(tasks) {
    _.each(this.taskViews || [], function(taskView) { taskView.remove(); });
    this.taskViews = [];

    _.each(tasks, function(task) {
      var view = new MoustacheBurrito.ItineraryTaskView({task: task, itineraryView: this});
      view.render();
      this.$el.append(view.el);
    }, this);
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