/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @class The date class wraps up the AllPlayers Date-Time object used in
 * several parameters for Event creation, etc.
 *
 * <p><strong>Usage:</strong></p>
 * <pre><code>
 *   var start = new Date('2010-09-01T00:00:00');  // Start on 9-1-2011
 *   var end = new Date('2012-09-20T00:00:00');    // End on 9-20-2012
 *   var repeat = {
 *     interval:1,                            // The repeat interval.
 *     freq:'DAILY',                          // Repeat Daily
 *     until:new Date('2012-09-04T00:00:00'), // Go until 9-4-2012
 *     bymonth: ['1'],                        // January
 *     bymonthday: ['3'],                     // 3rd of the month.
 *     byday: [
 *       'SU' => 'SU',                        // Sunday
 *       '+1MO' => '+1MO',                    // First Monday of the Month
 *       '+2WED' => '+2WED',                  // 2nd Wed of the month
 *     ],
 *     exdate: [
 *       '2011-09-04T00:00:00'                // Except 9-4-2011
 *       '2011-10-03T00:00:00'                // Except 10-3-2011
 *     ],
 *     rdate: [
 *       '2011-09-01T00:00:00'                // Add 9-1-2011
 *       '2011-10-04T00:00:00'                // ADD 10-4-2011
 *     ]
 *   };
 *
 *   // Create a new AllPlayers Date object.
 *   var date = new allplayers.date(start, end, repeat);
 *
 *   // Add additional exceptions.
 *   date.addException('2011-09-10T00:00:00');
 *
 *   // Add additional dates.
 *   date.addRDate('2011-10-10T00:00:00');
 * </code></pre>
 *
 * @param {Date} start The start date.
 * @param {Date} end The end date.
 * @param {object} repeat The repeat rule. In the following form.
 */
allplayers.date = function(start, end, repeat) {

  /**
   * Creates a new date based on a parameter which could be a string, Date
   * object, or nothing...
   *
   * @param {optional} date Either a date string, Date object, or nothing...
   * @return {Date} A JavaScript Date object.
   */
  this.newDate = function(date) {
    if (typeof date === 'string') {
      return new Date(date);
    }
    else if (typeof date === 'object') {
      return date;
    }
    else {
      return new Date();
    }
  };

  /** The start date */
  this.start = this.newDate(start);

  /** The end date */
  this.end = this.newDate(end);

  /** The repeat rule */
  this.repeat = repeat ? {
    interval: (repeat.interval ? repeat.interval : 1),
    freq: (repeat.freq ? repeat.freq : 'DAILY'),
    until: this.newDate(repeat.until),
    bymonth: (repeat.bymonth ? repeat.bymonth : []),
    bymonthday: (repeat.bymonthday ? repeat.bymonthday : []),
    byday: (repeat.byday ? repeat.byday : []),
    exdate: (repeat.exdate ? repeat.exdate : []),
    rdate: (repeat.rdate ? repeat.rdate : [])
  } : null;
};

// Need to fix the Date prototype to allow toISOString.
if (!Date.prototype.toISOString) {
  function padzero(n) {
    return n < 10 ? '0' + n : n;
  }
  function pad2zeros(n) {
    if (n < 100) {
      n = '0' + n;
    }
    if (n < 10) {
      n = '0' + n;
    }
    return n;
  }

  /**
   * Provide a toISOString method to the Date prototype.
   *
   * @return {string} An ISO string representation of the date object.
   */
  Date.prototype.toISOString = function() {
    var ISOString = this.getUTCFullYear() + '-';
    ISOString += padzero(this.getUTCMonth() + 1) + '-';
    ISOString += padzero(this.getUTCDate()) + 'T';
    ISOString += padzero(this.getUTCHours()) + ':';
    ISOString += padzero(this.getUTCMinutes()) + ':';
    ISOString += padzero(this.getUTCSeconds()) + '.';
    ISOString += pad2zeros(this.getUTCMilliseconds()) + 'Z';
    return ISOString;
  };
}

/**
 * Updates the date start and end dates and repeat rule.
 *
 * @param {Date} start The new start date.
 * @param {Date} end The new end date.
 * @param {object} repeat The new repeat rule.
 */
allplayers.date.prototype.update = function(start, end, repeat) {
  this.start = start ? this.newDate(start) : this.start;
  this.end = end ? this.newDate(end) : this.end;
  if (repeat) {
    repeat.until = this.newDate(repeat.until);
    jQuery.extend(this.repeat, repeat);
  }
};

/**
 * Adds a generic new date to repeat rule.
 *
 * @param {string} param The repeat rule parameter to set.
 * @param {optional} date Either a date string, Date object, or nothing...
 */
allplayers.date.prototype.addDate = function(param, date) {

  // Normalize the date parameter.
  date = this.newDate(date);

  // Add this date.
  this.repeat[param].push(date);
};

/**
 * Add's an exception date to the repeat rule.
 *
 * @param {Date} except An exception date to remove from the repeat rule.
 */
allplayers.date.prototype.addException = function(except) {

  // Add an exception.
  this.addDate('except', except);
};

/**
 * Adds an additional date to the repeat rule.
 *
 * @param {Date} addition An additional date to add to the repeat rule.
 */
allplayers.date.prototype.addRDate = function(addition) {

  // Add an addition.
  this.addDate('rdate', addition);
};

/**
 * Returns the object which will be passed to the services API.
 *
 * @return {object} The JSON object representation of this object.
 */
allplayers.date.prototype.get = function() {
  var i = 0;
  var obj = {
    start: this.start.toISOString(),
    end: this.end.toISOString()
  };

  // If there is a repeat rule, then add that to the object.
  if (this.repeat) {
    obj.repeat = {
      interval: this.repeat.interval,
      freq: this.repeat.freq,
      until: this.repeat.until.toISOString(),
      bymonth: this.repeat.bymonth,
      bymonthday: this.repeat.bymonthday,
      byday: this.repeat.byday,
      exdate: [],
      rdate: []
    };

    // Iterate through the exdate and rdate and add the date strings.
    i = this.repeat.exdate.length;
    while (i--) {
      obj.repeat.exdate.push(this.repeat.exdate[i].toISOString());
    }

    i = this.repeat.rdate.length;
    while (i--) {
      obj.repeat.rdate.push(this.repeat.rdate[i].toISOString());
    }
  }

  return obj;
};
