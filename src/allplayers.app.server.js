var allplayers = allplayers || {app: {}};

(function(window, document, allplayers, $, undefined) {
  if ($ && !$.fn.allplayers_server) {

    /**
     * Define the jQuery plugin.
     *
     * @param {object} options The options for this plugin.
     * @return {object} A jQuery object.
     * @this The jQuery context for each element.
     **/
    $.fn.allplayers_server = function(options) {
      return $(this).each(function() {
        new allplayers.app.server(options, $(this));
      });
    };
  }

  /**
   * The allplayers app server.
   *
   * @param {object} options The options for this app server.
   * @param {object} context The display context for this plugin.
   * @this The allplayers.app.server.
   */
  allplayers.app.server = function(options, context) {

    // Store the context.
    this.context = context;

    // Call the allplayers.app constructor.
    allplayers.app.call(this, options, {
      spinner: '',
      loading: 'Loading',
      base: 'https://platform.allplayers.com',
      type: 'registration',
      group: 'api',
      query: {},
      reg: {},
      checkout: {},
      src: '',
      style: '',
      complete: function() {}
    });
  };

  /** Derive from allplayers.app. */
  allplayers.app.server.prototype = new allplayers.app();

  /** Reset the constructor. */
  allplayers.app.server.prototype.constructor = allplayers.app.server;

  /**
   * Initialize the allplayer app library.
   */
  allplayers.app.server.prototype.init = function() {

    // Call the parent.
    allplayers.app.prototype.init.call(this);

    // Get the base URL of the embed page.
    this.baseURL = 'https://platform.allplayers.com';
    if (this.options.base) {
      this.baseURL = this.options.base;
    }

    // Say we are loading.
    this.isLoading = true;

    // Set the spinner if it isn't set.
    if (!this.options.spinner) {
      this.options.spinner = this.options.base;
      this.options.spinner += '/sites/all/themes/basic_foundation';
      this.options.spinner += '/images/loader.gif';
    }

    // Say that the plugin isn't ready.
    this.pluginReady = false;

    // Add the loading and iframe.
    var loading = $(document.createElement('div')).css({
      background: 'url(' + this.options.spinner + ') no-repeat 10px 13px',
      padding: '10px 10px 10px 60px',
      width: '100%'
    });

    // Add the loading text.
    loading.append(this.options.loading);

    // Add the iframe.
    var iframeId = this.context.attr('id') + '_iframe';

    // Define our own isEmptyObject function.
    var isEmptyObject = function(obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    };

    // Get the source for the iframe.
    var source = '';

    // See if they provide their own query.
    var q = allplayers.app.getParam('apq');
    if (q) {
      source = this.options.base + '/' + q;
    }
    else if (this.options.src) {
      source = this.options.src;
    }
    else {
      source = this.options.base + '/g/' + this.options.group;
      switch (this.options.type) {
        case 'registration':
          source += '/register';
          break;
        case 'forms':
          source += '/forms';
          break;
      }

      // Add the type as a query parameter.
      this.options.query.etyp = this.options.type;
    }

    // Add the app source to the url.
    source += (source.search(/\?/) === -1) ? '?' : '&';

    // If they have some query options then add them here.
    if (!isEmptyObject(this.options.query)) {
      for (var param in this.options.query) {
        source += param + '=' + encodeURIComponent(this.options.query[param]);
        source += '&';
      }
    }

    // Add the iframe ID to the iframe source.
    source += '#' + iframeId;

    // Used for callbacks.
    var self = this;

    var iframe = $(document.createElement('iframe')).attr({
      id: iframeId,
      name: iframeId,
      scrolling: 'no',
      seamless: 'seamless',
      width: '100%',
      height: '0px',
      src: source
    }).css({
      border: 'none',
      overflowY: 'hidden'
    });

    // Create the loading element.
    this.context.append(loading);
    this.context.append(iframe);

    this.serverTarget = null;

    // The chrome plugin is ready.
    $.pm.bind('chromePluginReady', function() {
      self.pluginReady = true;
    });

    // Pass along chrome message responses.
    $.pm.bind('chromeMsgResp', function(data) {
      $.pm({
        target: self.serverTarget,
        url: self.baseURL,
        type: 'chromeMsgResp',
        data: data
      });
    });

    // Pass along the chrome messages.
    $.pm.bind('chromeMsg', function(data) {
      $.pm({
        target: self.serverTarget,
        url: self.baseURL,
        type: 'chromeMsg',
        data: data
      });
    });

    // The init message.
    $.pm.bind('init', function(data, e) {
      self.serverTarget = e.source;
      self.isLoading = false;
      loading.remove();

      // Set the height
      iframe.height(data.height).attr('height', data.height + 'px');
      return data;
    });

    /**
     * Method to ensure that an added product is valid.
     *
     * @param {object} product
     *   The product to be added to the registration.
     *
     * @return {boolean}
     *   If this product is a valid product.
     */
    var productValid = function(product) {
      return product['product_uuid'] &&
        product['price'] &&
        product['quantity'] &&
        product['title'];
    };

    /**
     * Returns the product input.
     *
     * @param {string} uuid
     *   The uuid for the product input.
     *
     * @return {object}
     *   The jQuery object of the product input.
     */
    var productInput = function(uuid) {
      return $('input[product="' + uuid + '"]');
    };

    // The addProduct message.
    $.pm.bind('addProduct', function(data) {

      (new allplayers.product({uuid: data['product_uuid']})).getProduct(
        data['product_uuid'],
        function(result) {
          // Check if the UUIDs match.
          if (result.uuid == data['product_uuid']) {
            var uuid = data['product_uuid'];
            var product = productInput(uuid).val();

            // If a product was already found.
            if (product) {

              // Update the quantity.
              product = JSON.parse(product);
              product['quantity'] = parseInt(product['quantity']);
              product['quantity'] += parseInt(data['quantity']);
              productInput(uuid).val(JSON.stringify(product));
              var productCol = '#add-product-display-' + uuid;
              $(productCol + ' td:last').text(product['quantity']);
            }

            // Make sure the product is valid.
            else if (productValid(data)) {

              // If it is a product with a value greater than $0, or price isn't
              // supplied, use the price  assigned to the product in store.
              if (
                data['price'] == 'undefined' ||
                (result.type == 'product' && result.price_raw > 0)
              ) {
                data['price'] = result.price_raw / 100;
              }
              data['price'] = accounting.formatMoney(data['price']);
              data['title'] = result.title;

              // Create the input for the new product.
              $('<input>').attr({
                type: 'hidden',
                product: uuid,
                name: 'add-product[]',
                value: JSON.stringify(data)
              }).appendTo('form#og-registration-register-app');

              // Change the next button value.
              $('#edit-next').val('Continue');

              // Add the products table if not already.
              if ($('#add-products-table').length == 0) {
                $('<table>').attr({
                  id: 'add-products-table',
                  class: 'sticky-table'
                }).appendTo('#add-products');

                // Create the products table.
                $('#add-products-table').append(
                  '<thead>' +
                    '<tr>' +
                      '<th>Added Products</th>' +
                      '<th>Price</th>' +
                      '<th>Quantity</th>' +
                    '</tr>' +
                  '</thead>' +
                  '<tbody></tbody>'
                );
              }

              // Add the product to the table.
              $('#add-products-table tbody').append(
                '<tr id="add-product-display-' + uuid + '">' +
                  '<td>' + data['title'] + '</td>' +
                  '<td>' + data['price'] + '</td>' +
                  '<td>' + data['quantity'] + '</td>' +
                '</tr>'
              );
            }
          }
          else {
            alert('There was an error adding the product.');
          }
        }
      );
    });

    // The addCheckoutProduct message.
    $.pm.bind('addCheckoutProduct', function(data) {

      (new allplayers.product({uuid: data['product_uuid']})).getProduct(
        data['product_uuid'],
        function(result) {
          // Check if the UUIDs match.
          if (result && result.uuid == data['product_uuid']) {
            // The product exists.
          }
          else {
            // Need to create the product.
            (new allplayers.product({uuid: data['product_uuid']}))
              .createProduct(
                data,
                function(result) {
                  var i = 0;
                }
              );
          }
        }
      );
    });

    // The remove product message.
    $.pm.bind('removeProduct', function(data) {
      var uuid = data['product_uuid'];
      var product = productInput(uuid).val();
      if (product) {

        // Remove the input and table field.
        productInput(uuid).remove();
        $('#add-product-display-' + uuid).remove();
      }
    });

    // The client ready message.
    $.pm.bind('clientReady', function(data, e) {
      self.serverTarget = e.source;

      if (self.pluginReady) {
        $.pm({
          target: e.source,
          url: self.baseURL,
          type: 'chromePluginReady'
        });
      }

      if (self.options.type == 'registration') {
        // Send them the registration object.
        $.pm({
          target: e.source,
          url: self.baseURL,
          type: 'getRegistration',
          data: self.options.reg
        });
      }
      else if (self.options.type == 'checkout') {
        // Send them the checkout object.
        $.pm({
          target: e.source,
          url: self.baseURL,
          type: 'getCheckout',
          data: self.options.checkout
        });
      }
    });

    /**
     * Process a checkout.
     *
     * @param {object} checkout The checkout object.
     * @param {string} src The source.
     */
    allplayers.app.server.prototype.init.processCheckout = function(
      checkout,
      src) {
      $.pm({
        target: self.serverTarget,
        url: self.baseURL,
        type: 'processCheckout',
        data: checkout
      });
    };
  };
}(window, document, window.allplayers, jQuery));
