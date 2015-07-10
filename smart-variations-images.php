<?php

/*
  Plugin Name: Smart Variations Images
  Plugin URI: http://www.rosendo.pt
  Description: This is a WooCommerce extension plugin, that allows the user to add any number of images to the product images gallery and be used as variable product variations images in a very simple and quick way, without having to insert images p/variation.
  Author: David Rosendo
  Version: 0.1
  Author URI: http://www.rosendo.pt
 */

if (!class_exists('woo_svi')):

    class woo_svi {
        /*
         *  Constructor
         *
         *  This function will construct all the neccessary actions, filters and functions for the Easy Multiple Variations plugin to work
         *
         *  @type	function
         *  @date	12/02/14
         *  @since	0.1
         *
         *  @param	N/A
         *  @return	N/A
         */

        function __construct() {
            add_action('wp_enqueue_scripts', array($this, 'woo_svi_scripts'), 100);
        }

        function woo_svi_scripts() {
            wp_enqueue_script('woo_svijs', plugin_dir_url(__FILE__) . 'assets/js/woo_svi.js', array('jquery'), null, true);
        }

    }

    function woo_svi() {
        global $woo_svi;

        if (!isset($woo_svi)) {
            $woo_svi = new woo_svi();
        }

        return $woo_svi;
    }

// initialize
    woo_svi();
endif;