# Advanced Custom Fields: Relationship Multisite

Get post, pages and custom post types from another site of your WordPress Multisite installation.

**This plugin needs the installation/activation of Advanced Custom Fields V5**

### Installation

This add-on can be treated as both a WP plugin and a theme include.

**Install as Plugin**

1. Copy the 'acf-relationship-multisite' folder into your plugins folder
2. Activate the plugin via the Plugins admin page

**Include within theme**

1.	Copy the 'acf-relationship-multisite' folder into your theme folder (can use sub folders). You can place the folder anywhere inside the 'wp-content' directory
2.	Edit your functions.php file and add the code below (Make sure the path is correct to include the acf-date_time_picker.php file)

```php
add_action('acf/register_fields', 'my_register_fields');

function my_register_fields()
{
	include_once('acf-relationship-multisite/acf-relationship-multisite.php');
}
```

### Description

**Field settings**

The ACF Relationship Multisite field is similar to the standard ACF Relationship field. You will get the selection of all installed multisites and a few options.

http://www.dreihochzwo.de/acf-relationship-multisite/acf-relationship-multisite-field_settings.png

In editor mode you'll see from which site the post list is get from.

http://www.dreihochzwo.de/acf-relationship-multisite/acf-relationship-multisite_editor-field.png

**Usage**

The field content is stored in an two dimensional array. In this array [selected posts] you will get an array with the all the post objects (if you selet 'Post Object' in field sttings)

```
Array
(
    [selected_posts] => Array
        (
            [0] => WP_Post Object
                (
                    [ID] => 3
                    [post_author] => 1
                    [post_date] => 2014-09-18 19:56:07
                    [post_date_gmt] => 2014-09-18 19:56:07
                    [post_content] => 
                    [post_title] => My Sample Post
                    [post_excerpt] => 
                    [post_status] => publish
                    [comment_status] => open
                    [ping_status] => open
                    [post_password] => 
                    [post_name] => sample-post
                    [to_ping] => 
                    [pinged] => 
                    [post_modified] => 2014-09-18 19:56:07
                    [post_modified_gmt] => 2014-09-18 19:56:07
                    [post_content_filtered] => 
                    [post_parent] => 0
                    [guid] => http://yourdomain.com/multisite/?p=3
                    [menu_order] => 0
                    [post_type] => post
                    [post_mime_type] => 
                    [comment_count] => 0
                    [filter] => raw
                )

        )

    [site_id] => 5
)
```

or with all post ids (if you choose 'Post ID'). The second array [site_id] holds the site id of your selected multisite.

```
Array
(
    [selected_posts] => Array
        (
            [0] => 3
        )

    [site_id] => 5
)
```

To get the post on the frontend you need to do a foreach loop.

**With Post ID**

```php
	    // get field value
	    $posts = get_field('field_name');

	    if( $posts ):
	        // switch to multisite
	        switch_to_blog( $posts['site_id'] ); ?>
	        <ul>        
	            <?php foreach ($posts['selected_posts'] as $post): // variable must be called $post (IMPORTANT) ?>
	                <?php setup_postdata($post); ?>
	                <li>
	                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
	                    <span>Custom field from $post: <?php the_field('author'); ?></span>
	                </li>
	            <?php endforeach; ?>
	        </ul>
	        <?php wp_reset_postdata(); // IMPORTANT - reset the $post object so the rest of the page works correctly ?>
	        <?php restore_current_blog(); // IMPORTANT switch back to current site?>
	    <?php endif; ?>
```

**With Post Object**

```php
        // get field value
        $posts = get_field('field_name');

        if( $posts ):
            // switch to multisite
            switch_to_blog( $posts['site_id'] ); ?>
            <ul>        
                <?php foreach ($posts['selected_posts'] as $acf_post): ?>
                    <li>
                        <a href="<?php echo $acf_post->guid; ?>"><?php echo $acf_post->post_title; ?></a>
                        <span>Custom field from $post: <?php the_field('author', $acf_post->ID); ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
            <?php restore_current_blog(); // IMPORTANT switch back to current site?>
        <?php endif; ?>
```


### Compatibility

This plugin needs the installation of ACF 5. There's a version included for ACF 5.2.6 and before and a version for ACF 5.2.7 and newer.

### Changelog
**1.1.01**
* Fixed an error while seaching/scrolling in search field/list

**1.1.0**
* Update for ACF 5.2.7

**1.0.0**
* First release
