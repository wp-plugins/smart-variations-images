<?php

/*
  Plugin Name: Smart Variations Images
  Plugin URI: http://www.rosendo.pt
  Description: This is a WooCommerce extension plugin, that allows the user to add any number of images to the product images gallery and be used as variable product variations images in a very simple and quick way, without having to insert images p/variation.
  Author: David Rosendo
  Version: 0.2
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
            add_filter('attachment_fields_to_edit', array($this, 'woo_svi_field'), 10, 2);
            add_filter('attachment_fields_to_save', array($this, 'woo_svi_field_save'), 10, 2);
            add_filter('wp_get_attachment_image_attributes', array($this, 'add_woovsi_attribute'), 10, 2);
        }

        function woo_svi_scripts() {
            wp_enqueue_script('woo_svijs', plugin_dir_url(__FILE__) . 'assets/js/woo_svi.min.js', array('jquery'), null, true);
        }

        /**
         * Add woovsi field to media uploader
         *
         * @param $form_fields array, fields to include in attachment form
         * @param $post object, attachment record in database
         * @return $form_fields, modified form fields
         */
        function woo_svi_field($form_fields, $post) {

            $att = wc_get_attribute_taxonomy_names();
            if (!empty($att)) {

                $current = get_post_meta($post->ID, 'woosvi_slug', true);

                $html = "<select name='attachments[{$post->ID}][woosvi-slug]' id='attachments[{$post->ID}][woosvi-slug]'>";

                $variations = true;

                foreach ($att as $value) {
                    $html .="<option value='' " . selected($current, '', false) . ">none</option>";

                    $fabric_values = get_the_terms($_POST['post_id'], $value);

                    if (!empty($fabric_values)) {
                        foreach ($fabric_values as $fabric_value) {
                            $html .="<option value='" . $fabric_value->slug . "' " . selected($current, $fabric_value->slug, false) . ">" . $fabric_value->name . "</option>";
                        }
                    } else {
                        $variations = false;
                    }
                }

                $html .='</select>';

                if ($variations) {
                    $form_fields['woosvi-slug'] = array(
                        'label' => 'Variation Slug',
                        'input' => 'html',
                        'html' => $html,
                        'application' => 'image',
                        'exclusions' => array('audio', 'video'),
                        'helps' => 'Choose the variation Slug',
                    );

                    return $form_fields;
                }
            }
        }

        /**
         * Save values of woovsi in media uploader
         *
         * @param $post array, the post data for database
         * @param $attachment array, attachment fields from $_POST form
         * @return $post array, modified post data
         */
        function woo_svi_field_save($post, $attachment) {
            if (isset($attachment['woosvi-slug']))
                update_post_meta($post['ID'], 'woosvi_slug', $attachment['woosvi-slug']);


            return $post;
        }

        function add_woovsi_attribute($html, $post) {
            $current = get_post_meta($post->ID, 'woosvi_slug', true);

            $html['data-woovsi'] = $current;

            return $html;
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