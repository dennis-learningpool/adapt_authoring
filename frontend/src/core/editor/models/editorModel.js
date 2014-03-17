define(function(require) {
    var Backbone = require('backbone');
    var Origin = require('coreJS/app/origin');

    var EditorModel = Backbone.Model.extend({

      idAttribute: '_id',

      initialize : function(options) {
        this.on('sync', this.loadedData, this);
        this.fetch();
      },

      loadedData: function() {
        if (this.constructor._siblings) {
          this._type = this.constructor._siblings;
        } else {
          this._type = 'course';
        }
        Origin.trigger('editorModel:dataLoaded', this._type);
      },

      getChildren: function() {
        
        if (Origin.editor.data[this.constructor._children]) {
          var children = Origin.editor.data[this.constructor._children].where({_parentId:this.get("_id")});
          var childrenCollection = new Backbone.Collection(children);

          return childrenCollection;          
        } else {
          return null;
        }
      },

      getParent: function() {
        var currentType = this.get('_type');
        var parent;
        var currentParentId = this.get('_parentId');

        if (currentType === 'menu' || currentType === 'page') {
          if (currentParentId === Origin.editor.data.course.get('_id')) {
            parent = Origin.editor.data.course;
          } else {
            parent = Origin.editor.data.contentObjects.findWhere({_id: currentParentId});
          }
        } else if (currentType != 'course'){
          parent = Origin.editor.data[this.constructor._parent].findWhere({_id: currentParentId});
        }

        return parent;

      },

      getSiblings: function(returnMyself) {

          if (returnMyself) {
            var siblings = Origin.editor.data[this.constructor._siblings].where({_parentId:this.get("_parentId")});
            var siblingsCollection = new Backbone.Collection(siblings);

            return siblingsCollection;
          } else {

            if (this.get("_siblings")) return this.get("_siblings");
            var siblings = _.reject(Origin.editor.data[this.constructor._siblings].where({
                _parentId:this.get("_parentId")
            }), _.bind(function(model){ 
                return model.get('_id') == this.get('_id'); 
            }, this));
            var siblingsCollection = new Backbone.Collection(siblings);
            this.set("_siblings", siblingsCollection);
            
            // returns a collection of siblings
            return siblingsCollection;
          }
      },

      setOnChildren: function(key, value, options) {
            
            var args = arguments;
            
            if(!this._children) return;
            
            this.getChildren().each(function(child){
                child.setOnChildren.apply(child, args);
            });

      },

      /*getSiblings: function() {

        
      },*/

      getPossibleAncestors: function() {
        var map = {
          'articles': {
            'ancestor' : 'contentObjects',
            'ancestorType': 'page' 
          },
          'blocks' : {
            'ancestor' : 'articles',
            'ancestorType' : 'article'
          },
          'components' : {
            'ancestor' : 'blocks',
            'ancestorType' : 'block'            
          }
        };

        ancestors = Origin.editor.data[map[this.constructor._siblings].ancestor].where({_type: map[this.constructor._siblings].ancestorType});

        var ancestorsCollection = new Backbone.Collection(ancestors);

        return ancestorsCollection;
      },

      serialize: function() {
        return JSON.stringify(this);
      },

      serializeChildren: function() {
        var children = this.getChildren();
        var serializedJson = '';

        if (children) {
          _.each(children.models, function(child) {
            serializedJson += child.serialize();
          });  
        }

        return serializedJson;
      }
      
    });

    return EditorModel;

});
