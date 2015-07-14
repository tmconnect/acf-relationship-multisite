
/* **********************************************
     Begin ajax.js
********************************************** */

(function($){
	
	acf.ajax = acf.model.extend({
		
		actions: {
			'ready': 'onReady'
		},
		
		o : {
			action 			: 'acf/post/get_field_groups',
			post_id			: 0,
			page_template	: 0,
			page_parent		: 0,
			page_type		: 0,
			post_format		: 0,
			post_taxonomy	: 0,
			lang			: 0,
		},
		
		update : function( k, v ){
			
			this.o[ k ] = v;
			return this;
			
		},
		
		get : function( k ){
			
			return this.o[ k ] || null;
			
		},
		
		onReady : function(){
			
			// bail early if ajax is disabled
			if( ! acf.get('ajax') ) {
			
				return false;
				
			}
			
			
			// vars
			this.update('post_id', acf.get('post_id'));
			
			
			// MPML
			if( $('#icl-als-first').length > 0 ) {
			
				var href = $('#icl-als-first').children('a').attr('href'),
					regex = new RegExp( "lang=([^&#]*)" ),
					results = regex.exec( href );
				
				// lang
				this.update('lang', results[1]);
				
			}
			
			
			// add triggers
			this.add_events();
			
		},
		
		fetch : function(){
			
			// reference
			var _this = this;
			
			
			// ajax
			$.ajax({
				url			: acf.get('ajaxurl'),
				data		: acf.prepare_for_ajax( this.o ),
				type		: 'post',
				dataType	: 'json',
				success		: function( json ){
					
					if( acf.is_ajax_success( json ) ) {
						
						_this.render( json.data );
						
					}
					
				}
			});
			
		},
		
		render : function( json ){
			
			// hide all metaboxes
			$('.acf-postbox').addClass('acf-hidden');
			$('.acf-postbox-toggle').addClass('acf-hidden');
			
			
			// show the new postboxes
			$.each(json, function( k, field_group ){
				
				// vars
				var $el = $('#acf-' + field_group.key),
					$toggle = $('#adv-settings .acf_postbox-toggle[for="acf-' + field_group.key + '-hide"]');
				
				
				// classes
				$el.removeClass('acf-hidden hide-if-js');
				$toggle.removeClass('acf-hidden hide-if-js');
				$toggle.find('input[type="checkbox"]').attr('checked', 'checked');
				
				
				// replace HTML if needed
				$el.find('.acf-replace-with-fields').each(function(){
					
					$(this).replaceWith( field_group.html );
					
					acf.do_action('append', $el);
					
				});
				
				
				// update style if needed
				if( k === 0 )
				{
					$('#acf-style').html( field_group.style );
				}
				
			});
			
		},
		
		sync_taxonomy_terms : function(){
			
			// vars
			var values = [];
			
			
			$('.categorychecklist, .acf-taxonomy-field').each(function(){
				
				// vars
				var $el = $(this),
					$checkbox = $el.find('input[type="checkbox"]').not(':disabled'),
					$radio = $el.find('input[type="radio"]').not(':disabled'),
					$select = $el.find('select').not(':disabled'),
					$hidden = $el.find('input[type="hidden"]').not(':disabled');
				
				
				// bail early if not a field which saves taxonomy terms to post
				if( $el.is('.acf-taxonomy-field') && $el.attr('data-load_save') != '1' ) {
					
					return;
					
				}
				
				
				// bail early if in attachment
				if( $el.closest('.media-frame').exists() ) {
					
					return;
				
				}
				
				
				// checkbox
				if( $checkbox.exists() ) {
					
					$checkbox.filter(':checked').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $radio.exists() ) {
					
					$radio.filter(':checked').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $select.exists() ) {
					
					$select.find('option:selected').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $hidden.exists() ) {
					
					$hidden.each(function(){
						
						// ignor blank values or those which contain a comma (select2 multi-select)
						if( ! $(this).val() || $(this).val().indexOf(',') > -1 ) {
							
							return;
							
						}
						
						values.push( $(this).val() );
						
					});
					
				}
								
			});
	
			
			// filter duplicates
			values = values.filter (function (v, i, a) { return a.indexOf (v) == i });
			
			
			// update screen
			this.update( 'post_taxonomy', values ).fetch();
			
		},
		
		add_events : function(){
			
			// reference
			var _this = this;
			
			
			// page template
			$(document).on('change', '#page_template', function(){
				
				var page_template = $(this).val();
				
				_this.update( 'page_template', page_template ).fetch();
			    
			});
			
			
			// page parent
			$(document).on('change', '#parent_id', function(){
				
				var page_type = 'parent',
					page_parent = 0;
				
				
				if( $(this).val() != "" ) {
				
					page_type = 'child';
					page_parent = $(this).val();
					
				}
				
				_this.update( 'page_type', page_type ).update( 'page_parent', page_parent ).fetch();
			    
			});
			
			
			// post format
			$(document).on('change', '#post-formats-select input[type="radio"]', function(){
				
				var post_format = $(this).val();
				
				if( post_format == '0' )
				{
					post_format = 'standard';
				}
				
				_this.update( 'post_format', post_format ).fetch();
				
			});
			
			
			// post taxonomy
			$(document).on('change', '.categorychecklist input, .acf-taxonomy-field input, .acf-taxonomy-field select', function(){
				
				// a taxonomy field may trigger this change event, however, the value selected is not
				// actually a term relationship_multisite, it is meta data
				var $el = $(this).closest('.acf-taxonomy-field');
				
				if( $el.exists() && $el.attr('data-load_save') != '1' ) {
					
					return;
					
				}
				
				
				// this may be triggered from editing an image in a popup. Popup does not support correct metaboxes so ignore this
				if( $(this).closest('.media-frame').exists() ) {
					
					return;
				
				}
				
				
				// set timeout to fix issue with chrome which does not register the change has yet happened
				setTimeout(function(){
					
					_this.sync_taxonomy_terms();
				
				}, 1);
				
				
			});
			
			
			
			// user role
			/*
			$(document).on('change', 'select[id="role"][name="role"]', function(){
				
				_this.update( 'user_role', $(this).val() ).fetch();
				
			});
			*/
			
		}
		
	});


	
})(jQuery);


/* **********************************************
     Begin relationship.js
********************************************** */

(function($){
	
	acf.fields.relationship_multisite = acf.field.extend({
		
		type: 'relationship_multisite',
		
		$el: null,
		$input: null,
		$filters: null,
		$choices: null,
		$values: null,
		
		actions: {
			'ready':	'initialize',
			'append':	'initialize',
			//'show':		'show'
		},
		
		events: {
			'keypress [data-filter]': 			'submit_filter',
			'change [data-filter]': 			'change_filter',
			'keyup [data-filter]': 				'change_filter',
			'click .choices .acf-rel-item': 	'add_item',
			'click [data-name="remove_item"]': 	'remove_item'
		},
		
		focus: function(){
			
			// get elements
			this.$el = this.$field.find('.acf-relationship');
			this.$input = this.$el.find('.acf-hidden input');
			this.$choices = this.$el.find('.choices'),
			this.$values = this.$el.find('.values');
			
			// get options
			this.o = acf.get_data( this.$el );
			
		},
		
		initialize: function(){
			
			// reference
			var self = this,
				$field = this.$field,
				$el = this.$el,
				$input = this.$input;
			
			
			// right sortable
			this.$values.children('.list').sortable({
			
				items:					'li',
				forceHelperSize:		true,
				forcePlaceholderSize:	true,
				scroll:					true,
				
				update:	function(){
					
					$input.trigger('change');
					
				}
				
			});
			
			
			this.$choices.children('.list').scrollTop(0).on('scroll', function(e){
				
				// bail early if no more results
				if( $el.hasClass('is-loading') || $el.hasClass('is-empty') ) {
				
					return;
					
				}
				
				
				// Scrolled to bottom
				if( Math.ceil( $(this).scrollTop() ) + $(this).innerHeight() >= $(this).get(0).scrollHeight ) {
					
					// get paged
					var paged = $el.data('paged') || 1;
					
					
					// update paged
					$el.data('paged', (paged+1) );
					
					
					// fetch
					self.doFocus($field);
					self.fetch();
					
				}
				
			});
			
			
/*
			// scroll event
			var maybe_fetch = function( e ){
				console.log('scroll');
				// remove listener
				$(window).off('scroll', maybe_fetch);
				
				
				// is field in view
			    if( acf.is_in_view($field) ) {
					
					// fetch
					self.doFocus($field);
					self.fetch();
					
					
					// return
					return;
				}
						
				
				// add listener
				setTimeout(function(){
					
					$(window).on('scroll', maybe_fetch);
				
				}, 500);
				
			};
*/
			
			
			// fetch
			this.fetch();
			
		},
		
/*
		show: function(){
			
			console.log('show field: %o', this.o.xhr);
			
			// bail ealry if already loaded
			if( typeof this.o.xhr !== 'undefined' ) {
				
				return;	
				
			}
			
			
			// is field in view
		    if( acf.is_in_view(this.$field) ) {
				
				// fetch
				this.fetch();
				
			}
			
		},
*/
		
		fetch: function(){
			
			// reference
			var self = this,
				$field = this.$field;
			
			
			// add class
			this.$el.addClass('is-loading');
			
			
			// abort XHR if this field is already loading AJAX data
			if( this.o.xhr ) {
			
				this.o.xhr.abort();
				this.o.xhr = false;
				
			}
			
			
			// add to this.o
			this.o.action = 'acf/fields/relationship_multisite/query';
			this.o.field_key = $field.data('key');
			this.o.post_id = acf.get('post_id');
			
			
			// ready for ajax
			var ajax_data = acf.prepare_for_ajax( this.o );
			
			
			// clear html if is new query
			if( ajax_data.paged == 1 ) {
				
				this.$choices.children('.list').html('')
				
			}
			
			
			// add message
			this.$choices.find('ul:last').append('<p><i class="acf-loading"></i> ' + acf._e('relationship_multisite', 'loading') + '</p>');
			
			
			// get results
		    var xhr = $.ajax({
		    
		    	url:		acf.get('ajaxurl'),
				dataType:	'json',
				type:		'post',
				data:		ajax_data,
				
				success: function( json ){
					
					// render
					self.doFocus($field);
					self.render(json);
					
				}
				
			});
			
			
			// update el data
			this.$el.data('xhr', xhr);
			
		},
		
		render: function( json ){
			
			// remove loading class
			this.$el.removeClass('is-loading is-empty');
			
			
			// remove p tag
			this.$choices.find('p').remove();
			
			
			// no results?
			if( !json || !json.length ) {
			
				// add class
				this.$el.addClass('is-empty');
			
				
				// add message
				if( this.o.paged == 1 ) {
				
					this.$choices.children('.list').append('<p>' + acf._e('relationship_multisite', 'empty') + '</p>');
			
				}

				
				// return
				return;
				
			}
			
			
			// get new results
			var $new = $( this.walker(json) );
			
				
			// apply .disabled to left li's
			this.$values.find('.acf-rel-item').each(function(){
				
				$new.find('.acf-rel-item[data-id="' +  $(this).data('id') + '"]').addClass('disabled');
				
			});
			
			
			// underline search match
			if( this.o.s ) {
			
				var s = this.o.s;
				
				$new.find('.acf-rel-item').each(function(){
					
					// vars
					var find = $(this).text(),
						replace = find.replace( new RegExp('(' + s + ')', 'gi'), '<b>$1</b>');
					
					$(this).html( $(this).html().replace(find, replace) );	
									
				});
				
			}
			
			
			// append
			this.$choices.children('.list').append( $new );
			
			
			// merge together groups
			var label = '',
				$list = null;
				
			this.$choices.find('.acf-rel-label').each(function(){
				
				if( $(this).text() == label ) {
					
					$list.append( $(this).siblings('ul').html() );
					
					$(this).parent().remove();
					
					return;
				}
				
				
				// update vars
				label = $(this).text();
				$list = $(this).siblings('ul');
				
			});
			
			
		},
		
		walker: function( data ){
			
			// vars
			var s = '';
			
			
			// loop through data
			if( $.isArray(data) ) {
			
				for( var k in data ) {
				
					s += this.walker( data[ k ] );
					
				}
				
			} else if( $.isPlainObject(data) ) {
				
				// optgroup
				if( data.children !== undefined ) {
					
					s += '<li><span class="acf-rel-label">' + data.text + '</span><ul class="acf-bl">';
					
						s += this.walker( data.children );
					
					s += '</ul></li>';
					
				} else {
				
					s += '<li><span class="acf-rel-item" data-id="' + data.id + '">' + data.text + '</span></li>';
					
				}
				
			}
			
			
			// return
			return s;
			
		},
		
		submit_filter: function( e ){
			
			// don't submit form
			if( e.which == 13 ) {
				
				e.preventDefault();
				
			}
			
		},
		
		change_filter: function( e ){
			
			// vars
			var val = e.$el.val(),
				filter = e.$el.data('filter');
				
			
			// Bail early if filter has not changed
			if( this.$el.data(filter) == val ) {
			
				return;
				
			}
			
			
			// update attr
			this.$el.data(filter, val);
			
			
			// reset paged
			this.$el.data('paged', 1);
		    
		    
		    // fetch
		    this.fetch();
			
		},
		
		add_item: function( e ){
			
			// max posts
			if( this.o.max > 0 ) {
			
				if( this.$values.find('.acf-rel-item').length >= this.o.max ) {
				
					alert( acf._e('relationship_multisite', 'max').replace('{max}', this.o.max) );
					
					return;
					
				}
				
			}
			
			
			// can be added?
			if( e.$el.hasClass('disabled') ) {
			
				return false;
				
			}
			
			
			// disable
			e.$el.addClass('disabled');
			
			
			// template
			var html = [
				'<li>',
					'<input type="hidden" name="' + this.$input.attr('name') + '[]" value="' + e.$el.data('id') + '" />',
					'<span data-id="' + e.$el.data('id') + '" class="acf-rel-item">' + e.$el.html(),
						'<a href="#" class="acf-icon small dark" data-name="remove_item"><i class="acf-sprite-remove"></i></a>',
					'</span>',
				'</li>'].join('');
						
			
			// add new li
			this.$values.children('.list').append( html )
			
			
			// trigger change on new_li
			this.$input.trigger('change');
			
			
			// validation
			acf.validation.remove_error( this.$field );
			
		},
		
		remove_item : function( e ){
			
			// max posts
			if( this.o.min > 0 ) {
			
				if( this.$values.find('.acf-rel-item').length <= this.o.min ) {
				
					alert( acf._e('relationship_multisite', 'min').replace('{min}', this.o.min) );
					
					return;
					
				}
				
			}
			
			
			// vars
			var $span = e.$el.parent(),
				id = $span.data('id');
			
			
			// remove
			$span.parent('li').remove();
			
			
			// show
			this.$choices.find('.acf-rel-item[data-id="' + id + '"]').removeClass('disabled');
			
			
			// trigger change on new_li
			this.$input.trigger('change');
			
		}
		
	});
	

})(jQuery);