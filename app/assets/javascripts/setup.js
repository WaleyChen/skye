window.MoustacheBurrito = {
  templates: JST,
  user: {
    tasks: [],
    tags: []
  }
};

$(function(){
  if (!$('body.controller-schedule').length) return;

  MoustacheBurrito.start = MoustacheBurrito.time.now() - MoustacheBurrito.time.days(20);
  MoustacheBurrito.end = MoustacheBurrito.time.now() + MoustacheBurrito.time.days(100);
  MoustacheBurrito.secPerPixel = 100;

  $.get("/get_tasks?email=" + MoustacheBurrito.userid, function (data) {
    MoustacheBurrito.user.tasks = MoustacheBurrito.schedule(MoustacheBurrito.user.tasks.concat(data), MoustacheBurrito.user.tags).scheduled;
    console.log(MoustacheBurrito.user.tasks);
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
});
