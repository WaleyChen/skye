window.MoustacheBurrito = {
  templates: JST
};

$(function(){
  var view = new MoustacheBurrito.ScheduleView({el: $('body')[0]});
  view.render();
});
