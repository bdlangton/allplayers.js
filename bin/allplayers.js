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
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.event = function(object, callback, options) {
  drupal.node.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.event.prototype = new drupal.node();

/** Reset the constructor. */
allplayers.event.prototype.constructor = allplayers.event;

/** Declare the event api. */
allplayers.event.api = jQuery.extend(new drupal.api(), {
  resource: 'events'
});

/**
 * Returns an index of events.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
allplayers.event.index = function(query, callback, options) {
  drupal.entity.index(allplayers.event, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.event.prototype.set = function(object) {
  drupal.node.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'event';

  /** Set the api to the drupal.node.api. */
  this.api = allplayers.event.api;

  /** Set the id based on the uuid of the object. */
  this.id = object.uuid || object.id || this.id || '';

  // Set the values for this entity.
  this.setValues({
    allDay: false,
    gids: [],
    description: '',
    resources: [],
    competitors: {},
    category: 'Other'
  }, object);

  /** The date-time object */
  this.date = new allplayers.date(object.start, object.end);
  this.start = this.date.start;
  this.end = this.date.end;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.event.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    allDay: this.allDay,
    gids: this.gids,
    description: this.description,
    resources: this.resources,
    competitors: this.competitors,
    category: this.category,
    date_time: this.date.get()
  });
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.group = function(object, callback, options) {
  drupal.node.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.group.prototype = new drupal.node();

/** Reset the constructor. */
allplayers.group.prototype.constructor = allplayers.group;

/** Declare the event api. */
allplayers.group.api = jQuery.extend(new drupal.api(), {
  resource: 'groups'
});

/**
 * Returns an index of groups.
 *
 * @param {object} query The query parameters.
 * @param {function} callback The callback function.
 * @param {object} options Options used to govern functionality.
 */
allplayers.group.index = function(query, callback, options) {
  drupal.entity.index(allplayers.group, query, callback, options);
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.group.prototype.set = function(object) {
  drupal.node.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'group';

  /** Set the api. */
  this.api = allplayers.group.api;

  /** Set the id based on the uuid of the object. */
  this.id = object.uuid || object.id || this.id || '';

  /** See if this group has children. */
  var has_value = object.hasOwnProperty('has_children');
  this.has_children = has_value ? object.has_children : !!this.has_children;

  /** A {@link allplayers.location} object. */
  this.location = object.location || this.location || new allplayers.location();

  // Set the values for this entity.
  this.setValues({
    activity_level: 0,
    list_in_directory: 0,
    active: false,
    registration_fees_enabled: '',
    approved_for_payment: '',
    accept_amex: '',
    primary_color: '',
    secondary_color: '',
    node_status: 0,
    logo: '',
    url: '',
    groups_above_uuid: [],
    registration_link: '',
    registration_text: ''
  }, object);
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.group.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    location: this.location.get(),
    activity_level: this.activity_level,
    list_in_directory: this.list_in_directory,
    active: this.active,
    registration_fees_enabled: this.registration_fees_enabled,
    approved_for_payment: this.approved_for_payment,
    accept_amex: this.accept_amex,
    primary_color: this.primary_color,
    secondary_color: this.secondary_color,
    node_status: this.node_status,
    logo: this.logo,
    uri: this.uri,
    url: this.url,
    groups_above_uuid: this.groups_above_uuid,
    registration_link: this.registration_link,
    registration_text: this.registration_text
  });
};

/**
 * Returns the events for this group.
 *
 * @param {object} query An object of the following parameters.
 * <ul>
 * <li><strong>start</strong> - The start date to get the events.</li>
 * <li><strong>end</strong> - The end date to get the events.</li>
 * <li><strong>fields</strong> - The fields to get.</li>
 * <li><strong>limit</strong> - The limit of events to get.</li>
 * <li><strong>offset</strong> - The offset of events for pagination.</li>
 * </ul>
 *
 * @param {function} callback The callback function to get the events.
 */
allplayers.group.prototype.getEvents = function(query, callback) {

  // Get the events within this group.
  this.api.get(this, 'events', query, function(events) {

    // Iterate through the events and create an event object out of them.
    for (var i in events) {
      events[i] = new allplayers.event(events[i]);
    }

    // Call the callback.
    callback(events);
  }, true);
};

/**
 * Returns the upcoming events for this group.
 *
 * @param {object} query An object of the following parameters.
 * <ul>
 * <li><strong>start</strong> - The start date to get the events.</li>
 * <li><strong>end</strong> - The end date to get the events.</li>
 * <li><strong>fields</strong> - The fields to get.</li>
 * <li><strong>limit</strong> - The limit of events to get.</li>
 * <li><strong>offset</strong> - The offset of events for pagination.</li>
 * </ul>
 *
 * @param {function} callback The callback function to get the events.
 */
allplayers.group.prototype.getUpcomingEvents = function(query, callback) {

  // Get the events within this group.
  this.api.get(this, 'events/upcoming', query, function(events) {

    // Iterate through the events and create an event object out of them.
    for (var i in events) {
      events[i] = new allplayers.event(events[i]);
    }

    // Call the callback.
    callback(events);
  }, true);
};

/**
 * Returns a hierachy tree of all the subgroups within this group.
 *
 * @param {object} query The query to add to the subgroups tree call.
 * @param {function} callback The callback function to get the subgroup tree.
 */
allplayers.group.prototype.getGroupTree = function(query, callback) {

  // Get the subgroups tree.
  this.api.get(this, 'subgroups/tree', query, callback, true);
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers event class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.location = function(object, callback, options) {

  // Derive from drupal.entity.
  drupal.entity.call(this, object, callback, options);
};

/** Derive from drupal.entity. */
allplayers.location.prototype = new drupal.entity();

/** Reset the constructor */
allplayers.location.prototype.constructor = allplayers.location;

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.location.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);
  this.setValues({
    street: 0,
    city: '',
    state: '',
    zip: '',
    country: '',
    latitude: '',
    longitude: ''
  }, object);
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.location.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    street: this.street,
    city: this.city,
    state: this.state,
    zip: this.zip,
    country: this.country,
    latitude: this.latitude,
    longitude: this.longitude
  });
};
/** The allplayers namespace. */
var allplayers = allplayers || {};

(function($) {

  /** The default options. */
  var defaults = {
    dialog: '#calendar-dialog-form'
  };

  // Store all the calendar instances.
  allplayers.calendars = {};

  // Add a way to instanciate using jQuery prototype.
  if (!$.fn.allplayers_calendar) {
    $.fn.allplayers_calendar = function(options) {
      return $(this).each(function() {
        if (!allplayers.calendars[$(this).selector]) {
          new allplayers.calendar($(this), options);
        }
      });
    };
  }

  /**
   * @class The AllPlayers calendar JavaScript API
   *
   * <p><strong>Usage:</strong>
   * <pre><code>
   *
   *   // Create a calendar
   *   var player = $("#calendar").apcicalendar({
   *
   *   });
   *
   * </code></pre>
   * </p>
   *
   * @param {object} context The jQuery context.
   * @param {object} options This components options.
   */
  allplayers.calendar = function(context, options) {

    // Make sure we provide default options...
    var _this = this;
    options = $.extend(defaults, options, {
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      editable: true,
      dayClick: function(date, allDay, jsEvent, view) {
        console.log(date);
        console.log(allDay);
        console.log(jsEvent);
        console.log(view);
      },
      eventClick: function(event, jsEvent, view) {
        console.log(event);
        console.log(jsEvent);
        console.log(view);
        //_this.dialog.show().dialog();
      },
      eventDrop: function(event, jsEvent, ui, view) {

        // Save this event.
        event.obj.update(event);
        event.obj.save();
      },
      eventResizeStop: function(event, jsEvent, ui, view) {

        // Save this event.
        event.obj.update(event);
        event.obj.save();
      },
      events: function(start, end, callback) {
        _this.getEvents(start, end, callback);
      }
    });

    /** The calendar dialog to edit events */
    this.dialog = $(options.dialog, context).hide();

    // Store this player instance.
    allplayers.calendars[options.id] = this;

    // TO-DO: MAKE IT SO THAT WE DON'T NEED A GROUP TO GET EVENTS
    this.uuid = '';

    // Create the fullcalendar.
    context.fullCalendar(options);
  };

  allplayers.calendar.prototype.onEventClick = function() {
    console.log('Event has been clicked');
  };

  allplayers.calendar.prototype.getUUID = function(callback) {
    if (this.uuid) {
      callback.call(this);
    }
    else {
      var _this = this;
      var query = {search: 'Spring Soccer 2011'};
      allplayers.api.searchGroups(query, function(groups) {
        _this.uuid = groups[0].uuid;
        callback.call(_this);
      });
    }
  };

  /**
   * Get's all the events in this calendar.
   *
   * @param {Date} start The start timeframe.
   * @param {Date} end The end timeframe.
   * @param {function} callback The callback function to return the events.
   */
  allplayers.calendar.prototype.getEvents = function(start, end, callback) {

    // Format the start and end strings according to the AllPlayers API.
    var startString = start.getFullYear() + '-';
    startString += (start.getMonth() + 1) + '-';
    startString += start.getDate();

    var endString = end.getFullYear() + '-';
    endString += (end.getMonth() + 1) + '-';
    endString += end.getDate();

    this.getUUID(function() {
      allplayers.api.getGroupEvents(this.uuid, {
        start: startString,
        end: endString,
        fields: '*',
        limit: 0,
        offset: 0
      }, function(events) {

        // Iterate through the events and make them allplayers.event's
        var i = events.length;
        while (i--) {
          events[i].id = events[i].uuid;
          events[i].obj = new allplayers.event(events[i]);
        }

        // Add this to the events for the calendar.
        callback(events);
      });
    });
  };

}(jQuery));

