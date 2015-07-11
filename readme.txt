=== Plugin Name ===
Contributors: drosendo
Donate link: http://www.rosendo.pt/
Tags: WooCommerce, images variations, gallery, woocommerce variations, woocommerce variations images, woocommerce images
Requires at least: 3.0.1
Tested up to: 4.2
Stable tag: 0.2.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This is a WooCommerce extension plugin, that allows the user to add any number of images to the product images gallery and be used as variable product variations images in a very simple and quick way, without having to insert images p/variation.

== Description ==

By default WooCommerce will only swap the main variation image when you select a product variation, not the gallery images below it. 

This extension allows visitors to your online store to be able to swap different gallery images when they select a product variation. 
Adding this feature will let visitors see different images of a product variation all in the same colour and style.

This extension will allow the use of multiple images per variation, and simplifies it! How?
Instead of upload one image per variation, upload all the variation images the product gallery and for each image CAPTION insert the slug of the variation.
As quick and simple as that!

Check out a demo at: http://www.rosendo.pt/en/product/demo-smart-variations-images/

Take a look at the Screenshots section on how to work with it!


== Installation ==

1. Upload the entire `smart-variations-images` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. On your product assign the product attributes and save
4. Go to Product Gallery and upload/choose your images
5. Assing the slugs to be used for the variation images for each of the image and save.
6. Good luck with sales :)

== Screenshots ==

1. Add images to your Product Gallery
2. Choose the images to be used and select the "slug" of the variation in the "Variation Slug" field.
3. Hides all other images that dont match the variation, and show only the default color, if no default is choosen, the gallery is hidden.
4. On change the variation, images in the gallery also change to match the variation. The image in the gallery when click should show in the bigger image(above).

== Changelog ==

= 0.2.1 =
Fixed Warning message from appearing if WP_DEBUG was true preventing images from showing.

= 0.2 =
No longer use of caption field for Variation, new field has been added to replace the caption.
Javascript will search for new tag and loop the gallery.

= 0.1 =
Just released into the wild.

