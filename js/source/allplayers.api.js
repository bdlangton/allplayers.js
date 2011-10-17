/** The allplayers namespace. */
var allplayers = allplayers || {};

(function($) {

  /**
   * @class The API class that governs the AllPlayers API.
   *
   * @extends allplayers.base
   * @param {object} options The options for this class.
   */
  allplayers.api = function(options) {

    /** The default options for the api. */
    var defaults = {
      api_path: 'https://www.ttidwell.allplayers.com/api/v1/rest'
    };

    // Derive from allplayers.base.
    options = $.extend(defaults, options);
    allplayers.base.call(this, null, options);
  };

  // Create the proper derivation.
  allplayers.api.prototype = new allplayers.base();
  allplayers.api.prototype.constructor = allplayers.api;

  /**
   * Master API function to get any results from the AllPlayers API.
   *
   * @param {string} type The content type returned from the API
   * (groups, events, resources, etc).
   *
   * @param {object} params The additional params for this API.
   * <ul>
   * <li><strong>uuid</strong> - The universal unique ID.</li>
   * <li><strong>filter</strong> - Additional content type filter.</li>
   * <li><strong>query</strong> - key-value pairs to add to query string.</li>
   * </ul>
   *
   * @param {function} callback The callback function.
   */
  allplayers.api.prototype.get = function(type, params, callback) {
    var path = this.options.api_path + '/' + type;
    path += params.uuid ? ('/' + params.uuid) : '';
    path += params.filter ? ('/' + params.filter) : '';
    path += '.jsonp?';
    path += params.query ? (jQuery.param(params.query) + '&') : '';
    path += 'callback=?';
    $.getJSON(path, function(data, textStatus) {
      if (textStatus == 'success') {
        callback(data);
      }
      else {
        this.log('Error: ' + textStatus);
      }
    });
  };


  /**
   * Get the groups based on a search query.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#search
   */
  allplayers.api.prototype.searchGroups = function(query, callback) {
    this.get('groups', {query: query}, callback);
  };


  /**
   * Return a group provided a uuid.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#uuid
   */
  allplayers.api.prototype.getGroup = function(uuid, query, callback) {
    this.get('groups', {uuid: uuid, query: query}, callback);
  };

  /**
   * Saves a group
   */
  allplayers.api.prototype.saveGroup = function(group) {
    this.log('Saving Group');
    this.log(group);
  };

  /**
   * Returns a groups albums provided a uuid.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#albums
   */
  allplayers.api.prototype.getGroupAlbums = function(uuid, query, callback) {
    this.get('groups', {uuid: uuid, query: query, filter: 'albums'}, callback);
  };

  /**
   * Returns a groups events provided a uuid.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#events
   */
  allplayers.api.prototype.getGroupEvents = function(uuid, query, callback) {
    this.get('groups', {uuid: uuid, query: query, filter: 'events'}, callback);
  };

  /**
   * Returns a groups members provided a uuid.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#members
   */
  allplayers.api.prototype.getGroupMembers = function(uuid, query, callback) {
    this.get('groups', {uuid: uuid, query: query, filter: 'members'}, callback);
  };

  /**
   * Returns a groups photos provided a uuid.
   *
   * @see https://www.allplayers.com/api/v1/rest/wadl/describe.xml#photos
   */
  allplayers.api.prototype.getGroupPhotos = function(query, callback) {
    this.get('groups', {query: query, filter: 'photos'}, callback);
  };

  /**
   * Saves an event
   */
  allplayers.api.prototype.saveEvent = function(event) {
    this.log('Saving Event');
    this.log(event);
  };

}(jQuery));


