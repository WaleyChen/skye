MoustacheBurrito.CreateTaskView = Backbone.View.extend({

  initialize: function(options) {
    this.$el.find('[type=submit]').on('click', this.onSubmit.bind(this));
    this.scheduleView = options.scheduleView;
  },

  onSubmit: function(event) {
    var task = {};
    _.each(['name', 'description', 'duration'], function(field) {
      task[field] = $('[name='+field+']').val();
    });
    if ($('[name=endBefore]').val()) {
      var date = $('[name=endBefore]').val().split('-');
      task.endBefore = MoustacheBurrito.time.from(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
      task.tags = _.map(_.compact($('[name=hidden-tags]').val().split(',')), function(name) {
        return _.find(MoustacheBurrito.user.tags, function(tag) { return tag.name == name }).id
      });
    } else {
      task.endBefore = Math.floor(MoustacheBurrito.time.now() + MoustacheBurrito.time.days(365));
    }
    task.startAfter = Math.floor(MoustacheBurrito.time.now());
    task.duration = parseInt(task.duration || MoustacheBurrito.time.hours(1));
    
    MoustacheBurrito.user.tasks.push(task);
    var result = MoustacheBurrito.schedule(MoustacheBurrito.user.tasks);
    MoustacheBurrito.user.tasks = result.scheduled;

    this.scheduleView.itineraryView.renderTasks(MoustacheBurrito.user.tasks);

    this.scheduleView.calendarView.activeDay(task.scheduledStart);
    this.scheduleView.scrollToTime(task.scheduledStart);
    
    event.preventDefault();
  }
  
});