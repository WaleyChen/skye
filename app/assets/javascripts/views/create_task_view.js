MoustacheBurrito.CreateTaskView = Backbone.View.extend({

  initialize: function() {
    this.$el.find('[type=submit]').on('click', this.onSubmit.bind(this));
  },

  onSubmit: function(event) {
    var task = {};
    _.each(['name', 'description', 'endBefore', 'tags'], function(field) {
      task[field] = $('[name='+field+']').val();
    });
    task['endBefore'] = Date.parse(task['endBefore'])/1000;
    alert(JSON.stringify(task));

    event.preventDefault();
  }
  
});