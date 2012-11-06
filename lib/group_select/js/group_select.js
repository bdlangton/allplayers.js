(function($) {
  // Add the group select widget.
  $.fn.group_select = function(params) {

    // Make sure we have default params.
    params = jQuery.extend({
      uuid: 0,
      depth: 8,
      sort: 'TITLE_ASC',
      include_group_info: 0,
      include_hidden: 0,
      onRoot: null,
      is_admin: 0,
      is_member: 0
    },params);

    // Setup the drupal endpoint.
    drupal.endpoint = '/api/v1/rest';

    return $(this).each(function() {

      /**
       * Converts the drupal return of tree structure to the common
       * treeselect control pattern.
       */
      var getTreeNode = function(node) {
        var treenode = {};
        if (!node) {
          return null;
        }
        var has_children = parseInt(node.has_children);
        treenode.id = node.uuid || params.uuid;
        treenode.value = node.nid;
        treenode.title = node.title;
        treenode.url = node.url;
        treenode.has_children = has_children;
        treenode.data = node;
        treenode.children = [];
        var child = null;
        for (var id in node.below) {
          if (node.below.hasOwnProperty(id)) {
            if (child = getTreeNode(node.below[id])) {
              treenode.children.push(child);
            }
          }
        }
        return treenode;
      };

      /**
       * Called to load a new treenode.
       */
      params.load = function(treenode, callback) {
        (new allplayers.group({id: treenode.id || params.uuid})).getGroupTree({
          depth: params.depth,
          sort: params.sort,
          include_group_info: params.include_group_info,
          include_hidden: params.include_hidden,
          inclusive: 1,
          is_admin: params.is_admin,
          is_member: params.is_member
        }, function(node) {
          var root = getTreeNode(node);
          if (params.onRoot) {
            params.onRoot(root);
          }
          callback(root);
        });
      };

      // Setup the input ID.
      params.inputId = 'chosentree-select-' + params.uuid;

      // Create the chosentree item.
      $(this).chosentree(params);
    });
  };
})(jQuery);

