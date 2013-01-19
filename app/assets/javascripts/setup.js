var startAfter = new Date(), endBefore = new Date();
startAfter.setHours(9);
endBefore.setHours(14);

window.MoustacheBurrito = {
  templates: JST,
  user: {
    tasks: []
  }
};

$(function(){
  if (!$('body.controller-schedule').length) return;

  MoustacheBurrito.start = MoustacheBurrito.time.now() - MoustacheBurrito.time.days(100);
  MoustacheBurrito.end = MoustacheBurrito.time.now() + MoustacheBurrito.time.days(100);

  MoustacheBurrito.user.tasks = [{
    id: 0,
    name: "Sleep",
    description: "We will all sleep on the 3rd floor of Towne",
    duration: MoustacheBurrito.time.hours(4),
    scheduledStart: MoustacheBurrito.time.fromDate(startAfter)
  }, {
    id: 1,
    name: "Hack",
    description: "Code monkey get up get coffee",
    duration: MoustacheBurrito.time.hours(4),
    scheduledStart: MoustacheBurrito.time.fromDate(endBefore)
  }]

  var view = new MoustacheBurrito.ScheduleView({
    el: $('body'),
    start: MoustacheBurrito.time.now() - MoustacheBurrito.time.days(100),
    end: MoustacheBurrito.time.now() + MoustacheBurrito.time.days(100)
  });

  view.render();
  view.scrollToTime(MoustacheBurrito.time.now());
  view.calendarView.scrollToTime(MoustacheBurrito.time.now());

});
