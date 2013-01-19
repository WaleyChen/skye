MoustacheBurrito.CalendarView = Backbone.View.extend({

  tagName: 'table',

  className: 'calendar',

  initialize: function(settings) {
    this.start = settings.start;
    this.end = settings.end;
    this.scheduleView = settings.scheduleView;

    var that = this;
    this.$el.on('click', 'td', function() {
      that.onCellClick($(this));
    });
  },

  render: function() {
    var now = new Date();

    var $row = $('<tr/>');
    this.$el.append($row);

    var start = MoustacheBurrito.time.toDate(this.start);
    var end = MoustacheBurrito.time.toDate(this.end);

    this.cells = [];

    for (start = start; start.getTime() < end.getTime(); start.setDate(start.getDate() + 1)) {
      if (start.getDay() == 0) {
        $row = $('<tr/>');
        this.$el.append($row);
      }

      var $cell = $('<td>' + start.getDate() + '</td>');

      if (start.getDay() == 0 || start.getDay() == 6) $cell.addClass('weekend');
      $cell.addClass(start.getMonth() % 2 ? 'month-odd' : 'month-even');
      $cell.data('time', MoustacheBurrito.time.fromDate(start));

      this.cells.push($cell); 
      $row.append($cell);
    }
    this.timeToCell(MoustacheBurrito.time.now()).addClass('today');
  },

  scrollToToday: function() {
    this.scrollToDate(new Date());
  },

  scrollToTime: function(time) {
    this.activeDay(time);
    var $cell = this.timeToCell(time);
    this.$el.parent().scrollTop($cell.position().top - 200);
  },

  onCellClick: function($cell) {
    var time = this.cellToTime($cell);
    this.activeDay(time);
    this.scheduleView.scrollToTime(time);
  },

  activeDay: function(time) {
    this.$el.find('.active').removeClass('active');
    this.timeToCell(time).addClass('active');
  },

  timeToCell: function(time) {
    return this.cells[Math.floor((time - this.start)/MoustacheBurrito.time.days(1))];
  },

  cellToTime: function($cell) {
    return $cell.data('time');
  }
});