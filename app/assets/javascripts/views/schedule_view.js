MoustacheBurrito.ScheduleView = Backbone.View.extend({
  initialize: function(settings) {
    this.calendarView = new MoustacheBurrito.CalendarView({
      start: settings.start,
      end: settings.end,
      scheduleView: this,
      tasks: settings.tasks
    });

    this.itineraryView = new MoustacheBurrito.ItineraryView({
      start: settings.start,
      end: settings.end,
      tasks: MoustacheBurrito.user.tasks,
      scheduleView: this,
      tasks: settings.tasks
    });
  },

  render: function() {
    this.calendarView.render();
    this.itineraryView.render();
    this.$el.find('.calendar-wrapper').append(this.calendarView.el);
    this.$el.find('.itinerary-wrapper').append(this.itineraryView.el);

    if (!this.createTaskView) {
      this.createTaskView = new MoustacheBurrito.CreateTaskView({
        el: this.$el.find('.create-task'),
        scheduleView: this
      });
    }
    this.createTaskView.render();

    this.$el.append();
  },

  scrollToTime: function(time, animate) {
    this.itineraryView.scrollToTime(time, animate);
  }
});