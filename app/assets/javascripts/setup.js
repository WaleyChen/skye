window.MoustacheBurrito = {
  templates: JST,
  user: {
    tasks: [],
    tags: [{
      id: 0,
      name: 'sleep',
      priority: 2
    }, {
      id: 1,
      name: 'school',
      priority: 1
    }]
  }
};

$(function(){
  if (!$('body.controller-schedule').length) return;

  $('[name=tags]').tagsManager({
    preventSubmitOnEnter: true,
    typeahead: true,
    typeaheadSource: function() { return _.pluck(MoustacheBurrito.user.tags, 'name'); }
  });

  MoustacheBurrito.start = MoustacheBurrito.time.now() - MoustacheBurrito.time.days(30);
  MoustacheBurrito.end = MoustacheBurrito.time.now() + MoustacheBurrito.time.days(100);
  MoustacheBurrito.secPerPixel = 125;

  var ret = MoustacheBurrito.schedule(MoustacheBurrito.user.tasks, MoustacheBurrito.user.tags);
  MoustacheBurrito.user.tasks = ret.scheduled;

  var view = new MoustacheBurrito.ScheduleView({
    el: $('body'),
    start: MoustacheBurrito.start,
    end: MoustacheBurrito.end,
    tasks: MoustacheBurrito.user.tasks
  });

  view.render();
  view.scrollToTime(MoustacheBurrito.time.now());
  view.calendarView.scrollToTime(MoustacheBurrito.time.now());
});
