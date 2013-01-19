MoustacheBurrito.CreateTaskView = Backbone.View.extend({

  initialize: function(options) {
    this.$el.find('[type=submit]').on('click', this.onSubmit.bind(this));
    this.scheduleView = options.scheduleView;
  },

  onSubmit: function(event) {
    var task = {};
    _.each(['name', 'description', 'endBefore', 'tags'], function(field) {
      task[field] = $('[name='+field+']').val();
    });
    task['endBefore'] = Date.parse(task['endBefore'])/1000;
    
    MoustacheBurrito.user.tasks.push(task);
    var result = MoustacheBurrito.schedule(_.clone(MoustacheBurrito.user.tasks));
    MoustacheBurrito.user.tasks = result.scheduled;

    this.scheduleView.render();

    event.preventDefault();
  }
  
});