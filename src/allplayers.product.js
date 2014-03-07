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
  // todo: get real group uuid.
  data.group_uuid = '91a9a05a-041f-11e1-a44b-12313d04fc0f';
  data.role_id = 0;
  data.role_name = 0;
  data.installments_enabled = 0;
  data.initial_payment = 0;
  data.installments = 0;
  data.total = accounting.unformat(data.price);
  var random_number = Math.floor(Math.random() * 1000);
  data.sku = 'adhoc-' + data.title + '-' + random_number;
  data.uri = this.uri;

  // Create the product.
  this.api.execute('products', data, callback);
};

/**
 * Add a product as line item in the order.
 *
 * @param {object} data Data for the product to create.
 * @param {function} callback The callback function.
 */
allplayers.product.prototype.addProductToCart = function(data, callback) {
  // Get the store URL.
  this.uri = 'https://' + window.location.host.replace('www', 'store');
  this.uri += '/api/v1/rest';

  // Get all of the necessary data.
  // todo: get real user and sold by uuid.
  var line_item = new Object();
  line_item.for_user_uuid = '6470bc5a-92b1-11e3-aa40-6e5cf81170a9';
  line_item.product_uuid = data['product_uuid'];
  line_item.sold_by_uuid = '91a9a05a-041f-11e1-a44b-12313d04fc0f';
  line_item.amount = data['total'];
  line_item.quantity = data['quantity'];
  line_item.uri = this.uri;

  // Create the product.
  this.api.execute(
    'users/' + line_item.for_user_uuid + '/add_to_cart',
    line_item,
    callback
  );
};
