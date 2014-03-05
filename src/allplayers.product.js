/** The allplayers namespace. */
var allplayers = allplayers || {};

/**
 * @constructor
 * @extends drupal.entity
 * @class The AllPlayers product class
 *
 * @param {object} object The node object.
 * @param {function} callback The function to be called once the node has
 * been retrieved from the server.
 * @param {object} options Options used to govern functionality.
 */
allplayers.product = function(object, callback, options) {
  drupal.entity.call(this, object, callback, options);
};

/** Derive from node. */
allplayers.product.prototype = new drupal.entity();

/** Reset the constructor. */
allplayers.product.prototype.constructor = allplayers.product;

/** Declare the product api. */
allplayers.product.api = jQuery.extend(new drupal.api(), {
  resource: 'products'
});

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
allplayers.product.prototype.get = function() {
  return jQuery.extend(drupal.node.prototype.get.call(this), {
    uri: this.uri
  });
};

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
allplayers.product.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'product';

  /** Set the api. */
  this.api = allplayers.product.api;

  /** Set the id. */
  this.id = '';

  /** A {@link allplayers.location} object. */
  this.location = object.location || this.location || new allplayers.location();
};

/**
 * Returns the product.
 *
 * @param {string} uuid The UUID of the product to retrieve.
 * @param {function} callback The callback function to get the product.
 */
allplayers.product.prototype.getProduct = function(uuid, callback) {
  // Get the product.
  this.uri = 'https://' + window.location.host.replace('www', 'store');
  this.uri += '/api/v1/rest/products';
  this.api.get(this, uuid, '', callback);
};

/**
 * Create a product.
 *
 * @param {object} data Data for the product to create.
 * @param {function} callback The callback function.
 */
allplayers.product.prototype.createProduct = function(data, callback) {
  // Get the store URL.
  this.uri = 'https://' + window.location.host.replace('www', 'store');
  this.uri += '/api/v1/rest';

  // Get all of the necessary data.
  data.type = 'product';
  data.group_uuid = '';
  data.role_id = 0;
  data.role_name = 0;
  data.installments_enabled = 0;
  data.initial_payment = 0;
  data.installments = 0;
  data.total = data.price;
  data.sku = 'abcd1234';
  data.uri = this.uri;

  // Create the product.
  this.api.execute('products', data, callback);
};
