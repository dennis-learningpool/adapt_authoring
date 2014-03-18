define(function(require) {

  var EditorModel = require('coreJS/editor/models/editorModel');

  var EditorConfigModel = EditorModel.extend({
    urlRoot: '/api/content/config',
    initialize: function() {}
  },
  {
    _siblings:'',
    _children: ''
  });

  return EditorConfigModel;

});
