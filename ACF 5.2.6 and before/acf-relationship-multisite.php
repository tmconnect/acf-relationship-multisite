<?php
/*
Plugin Name: Advanced Custom Fields: Relationship Multisite
Plugin URI: https://github.com/tmconnect/acf-relationship-multisite
Description: Get post, pages and custom post types from another site of your WordPress Multisite installation. This plugin needs the installation/activation of Advanced Custom Fields V5.
Version: 1.0.3 (ACF 5.2.6)
Author: Thomas Meyer
Author URI: www.dreihochzwo.de
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/




// 1. set text domain
// Reference: https://codex.wordpress.org/Function_Reference/load_plugin_textdomain
load_plugin_textdomain( 'acf-relationship-multisite', false, dirname( plugin_basename(__FILE__) ) . '/lang/' ); 


// 2. Include field type for ACF5
// $version = 5 and can be ignored until ACF6 exists
function include_field_types_relationship_multisite( $version ) {
	
	include_once('acf-relationship-multisite-v5.php');
	
}

add_action('acf/include_field_types', 'include_field_types_relationship_multisite');	

	
?>
