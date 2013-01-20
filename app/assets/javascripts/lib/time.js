MoustacheBurrito.time = {
  fromDate: function(date) {
    return date.getTime() / 1000;
  },

  from: function(year, month, day) {
    return new Date(year, month, day).getTime() / 1000;
  },

  toDate: function(time) {
    return new Date(time * 1000);
  },

  now: function() {
    return this.fromDate(new Date());
  },

  seconds: function(s) {
    return s;
  },

  minutes: function(m) {
    return this.seconds(m * 60);
  },

  hours: function(h) {
    return this.minutes(h * 60);
  },

  days: function(d) {
    return this.hours(d * 24);
  },

  truncate: function(d) {
    d = new Date(d.getTime());

    d.setHours(1);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
  }
}