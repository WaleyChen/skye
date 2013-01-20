window.MoustacheBurrito = {
  templates: JST,
  user: {
    tasks: []
  }
};

$(function(){
  if (!$('body.controller-schedule').length) return;

  MoustacheBurrito.start = 0;
  MoustacheBurrito.end = 20;
  MoustacheBurrito.secPerPixel = .01;

  var ret = MoustacheBurrito.schedule(MoustacheBurrito.seed.tasks, MoustacheBurrito.seed.tags);
  MoustacheBurrito.user.tasks = ret.scheduled;

  var view = new MoustacheBurrito.ScheduleView({
    el: $('body'),
    start: MoustacheBurrito.start,
    end: MoustacheBurrito.end,
    tasks: MoustacheBurrito.user.tasks
  });

  view.render();
  // view.scrollToTime(MoustacheBurrito.time.now());
  // view.calendarView.scrollToTime(MoustacheBurrito.time.now());
});
