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

    /**
     * Returns the product with an updated total.
     *
     * @param {object} product
     *   The product object.
     *
     * @return {object}
     *   The updated product object.
     */
    var productUpdateTotal = function(product) {
      // Add raw price if not already there.
      if (!product['price_raw']) {
        product['price_raw'] = accounting.unformat(product['price']) * 100;
      }

      // Format the price.
      product['price'] = accounting.formatMoney(product['price']);

      // Calculate the total price.
      product['total'] = accounting.formatMoney(
        product['price_raw'] * product['quantity'] / 100
      );

      return product;
    };

    /**
     * Add a product to the list of products.
     *
     * @param {array} products The array of already added products.
     * @param {object} product The product to add.
     *
     * @return {array}
     *   The updated list of products.
     */
    var addCheckoutProducts = function(products, product) {
      // Add the product info to the list of adhoc products to create.
      var newProduct = true;
      if (products) {
        products = JSON.parse(products);
        // Check if the adhoc product has already been added.
        for (var i = 0; i < products.length; i++) {
          if (
            products[i]['title'] == product['title'] &&
            products[i]['price_raw'] == product['price_raw']
          ) {
            // The product was found so increase the quantity and total price.
            newProduct = false;
            products[i]['quantity'] += product['quantity'];
            products[i]['total'] = accounting.formatMoney(
              products[i]['price_raw'] * products[i]['quantity'] /
              100
            );
            product = products[i];
            break;
          }
        }
      }
      else {
        products = new Array();
      }

      // If a new adhoc product, add it to the list.
      if (newProduct) {
        products.push(product);
      }
      addCheckoutProductInfo(product);

      return products;
    };

    /**
     * Process a checkout.
     *
     * @param {object} checkout The checkout object.
     * @param {array} adhocProducts Array of adhoc products.
     * @param {array} existingProducts Array of existing products.
     * @param {string} src The source.
     */
    allplayers.app.server.prototype.init.processCheckout = function(
      checkout,
      adhocProducts,
      existingProducts,
      src) {

      // Calculate the order total with the added adhoc/existing products.
      var orderTotal = checkout.commerce_order_total.und[0].amount;
      for (var i = 0; i < adhocProducts.length; i++) {
        orderTotal += adhocProducts[i].price_raw;
      }
      for (var i = 0; i < existingProducts.length; i++) {
        orderTotal += existingProducts[i].price_raw;
      }

      // Tell the client to process the checkout.
      $.pm({
        target: self.serverTarget,
        url: self.baseURL,
        type: 'processCheckout',
        data: {
          checkout: checkout,
          adhocProducts: adhocProducts,
          existingProducts: existingProducts,
          orderTotal: orderTotal
        }
      });
    };

    /**
     * Method to add the checkout product info to the table on the page.
     *
     * @param {object} product
     *   The product to be added.
     */
    var addCheckoutProductInfo = function(product) {
      var newProduct = true;

      // Check if the product is existing or adhoc.
      if (product['product_uuid']) {
        // If the product is already listed in the table, update the quantity
        // and total.
        if ($('tr#adhoc-product-' + product['product_uuid']).length > 0) {
          $('tr#adhoc-product-' + product['product_uuid'] + ' .quantity')
            .text(product['quantity']);
          $('tr#adhoc-product-' + product['product_uuid'] + ' .total')
            .text(product['total']);
          newProduct = false;
        }
      }
      else {
        // Check if the product is already in the table.
        $('.views-table tbody tr').each(function() {
          var title = $(this).find('.title').text();
          var price = $(this).find('.price').text();
          if (
            title &&
            price &&
            title.indexOf(product['title']) !== -1 &&
            price.indexOf(product['price']) !== -1
          ) {
            // Update quantity and total and exit the each loop.
            $(this).find('.quantity').text(product['quantity']);
            $(this).find('.total').text(product['total']);
            newProduct = false;
            return false;
          }
        });
      }

      // Add the product to the table if it's a new product.
      if (newProduct) {
        $('.views-table tbody').append(
          '<tr id="adhoc-product-' + product['product_uuid'] + '">' +
            '<td class="title">' + product['title'] + '</td>' +
            '<td class="seller"></td>' +
            '<td class="price">' + product['price'] + '</td>' +
            '<td class="quantity">' + product['quantity'] + '</td>' +
            '<td class="total">' + product['total'] + '</td>' +
          '</tr>'
        );
      }

      // Update the order total.
      var total = $('td.component-total').text();
      total = accounting.unformat(total) + (product['price_raw'] / 100);
      total = accounting.formatMoney(total);
      $('td.component-total').text(total);
    };

    // The addProduct action.
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
              data['title'] = result.title;
              data = productUpdateTotal(data);

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

    // The addCheckoutProduct action.
    $.pm.bind('addCheckoutProduct', function(data) {

      // If the product is existing.
      if (data && data['product_uuid']) {
        (new allplayers.product({uuid: data['product_uuid']})).getProduct(
          data['product_uuid'],
          function(result) {
            // Check if the UUIDs match.
            if (result && result.uuid == data['product_uuid']) {
              // The product exists.
              var uuid = data['product_uuid'];
              var product = productInput(uuid).val();
              var existingProducts = $('#add-existing-products-' +
                data['order_id']).val();

              // If a product was already found.
              if (product) {

                // Update the quantity.
                product = JSON.parse(product);
                product['quantity'] = parseInt(product['quantity']);
                product['quantity'] += parseInt(data['quantity']);
                productInput(uuid).val(JSON.stringify(product));
                var productCol = '#adhoc-product-' + uuid;
                $(productCol + ' td.quantity').text(product['quantity']);
              }

              // Make sure the product is valid.
              else if (productValid(data)) {

                // If it is a product with a value greater than $0, or price
                // isn't supplied, use the price  assigned to the product in
                // store.
                if (
                  data['price'] == 'undefined' ||
                  (result.type == 'product' && result.price_raw > 0)
                ) {
                  data['price'] = result.price_raw / 100;
                  data['price_raw'] = result.price_raw;
                }
                data['title'] = result.title;
                data = productUpdateTotal(data);
              }
              existingProducts = addCheckoutProducts(existingProducts, data);
              $('#add-existing-products-' + data['order_id'])
                .val(JSON.stringify(existingProducts));
            }
            else {
              alert('There was an error adding the product.');
            }
          }
        );
      }
      // The product is an adhoc product.
      else {
        // Update the product total price.
        data = productUpdateTotal(data);
        data['title'] += ' (Adhoc)';

        // Add the product info to the list of adhoc products to create.
        var adhocProducts = $('#add-adhoc-products-' + data['order_id']).val();
        adhocProducts = addCheckoutProducts(adhocProducts, data);

        $('#add-adhoc-products-' + data['order_id'])
          .val(JSON.stringify(adhocProducts));
      }
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
  };
}(window, document, window.allplayers, jQuery));
