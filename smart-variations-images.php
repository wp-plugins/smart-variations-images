<?php
/*
  Plugin Name: Smart Variations Images
  Plugin URI: http://www.rosendo.pt
  Description: This is a WooCommerce extension plugin, that allows the user to add any number of images to the product images gallery and be used as variable product variations images in a very simple and quick way, without having to insert images p/variation.
  Author: David Rosendo
  Version: 1.0
  Author URI: http://www.rosendo.pt
 */

if ( !class_exists( 'woo_svi' ) ):

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
			if ( is_admin() || ( is_multisite() && is_network_admin() ) ) {
				add_filter( 'woocommerce_get_sections_products', array( $this, 'woo_svi_add_section' ) );
				add_filter( 'woocommerce_get_settings_products', array( $this, 'woo_svi_all_settings' ), 10, 2 );
			}
			add_action( 'wp_enqueue_scripts', array( $this, 'woo_svi_scripts' ), 100 );
			add_filter( 'attachment_fields_to_edit', array( $this, 'woo_svi_field' ), 10, 2 );
			add_filter( 'attachment_fields_to_save', array( $this, 'woo_svi_field_save' ), 10, 2 );
			add_filter( 'wp_get_attachment_image_attributes', array( $this, 'add_woovsi_attribute' ), 10, 2 );
			add_action( 'template_redirect', array( $this, 'remove_gallery_and_product_images' ) );
			add_action( 'woocommerce_before_single_product_summary', array( $this, 'woo_svi_images' ) );
		}

		/**
		 * Add section to WooCommerce configurations
		 *
		 * @access public
		 *
		 */
		function woo_svi_add_section( $sections ) {

			$sections['woosvi'] = __( 'Smart Variations Images', 'text-domain' );
			return $sections;
		}

		/**
		 * Setup WooCommerce Options page
		 *
		 * @access public
		 *
		 */
		function woo_svi_all_settings( $settings, $current_section ) {

			/**
			 * Check the current section is what we want
			 * */
			if ( $current_section == 'woosvi' ) {

				$settings_slider = array();

// Add Title to the Settings
				$settings_slider[] = array( 'name' => __( 'Smart Variations Images', 'woosvi' ), 'type' => 'title', 'desc' => __( 'The following options are used to configure SVI', 'text-domain' ), 'id' => 'woosvi' );

// Add first checkbox option
				$settings_slider[] = array(
					'name' => __( 'Activate Lens Zoom', 'text-domain' ),
					'desc_tip' => __( 'This will activate Lens Zoom', 'text-domain' ),
					'id' => 'woosvi_activate',
					'type' => 'checkbox',
					'css' => 'min-width:300px;',
					'desc' => __( 'Enable Lens Zoom', 'text-domain' ),
				);

				$settings_slider[] = array( 'type' => 'sectionend', 'id' => 'woosvi' );




				return $settings_slider;

				/**
				 * If not, return the standard settings
				 * */
			} else {

				return $settings;
			}
		}

		function remove_gallery_and_product_images() {
			if ( is_product() ) {
				remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_images', 20 );
				remove_action( 'woocommerce_product_thumbnails', 'woocommerce_show_product_thumbnails', 20 );
			}
		}

		function woo_svi_scripts() {
			wp_enqueue_script( 'woo_svijs', plugin_dir_url( __FILE__ ) . 'assets/js/woo_svi.min.js', array( 'jquery' ), null, true );
			$active = get_option( 'woosvi_activate' );
			if ( $active == 'yes' ) {
				wp_enqueue_script( 'elevateZoom', plugin_dir_url( __FILE__ ) . 'assets/js/jquery.elevateZoom.js', array( 'jquery', 'woo_svijs' ), null, true );
			}
			wp_enqueue_style( 'woo_svicss', plugin_dir_url( __FILE__ ) . 'assets/css/woo_svi.css', array( 'woocommerce-layout', 'woocommerce-smallscreen', 'woocommerce-general' ), null );
		}

		function woo_svi_images() {
			global $product, $post;
			$active = get_option( 'woosvi_activate' );
			$class = "";
			if ( $active == 'yes' ) {
				$class = " woosvilens";
			}
			?>

			<div class="woosvi_images<?php echo $class; ?>">

				<?php
				if ( has_post_thumbnail() ) {

					$image_title = esc_attr( get_the_title( get_post_thumbnail_id() ) );
					$image_caption = get_post( get_post_thumbnail_id() )->post_excerpt;
					$image_link = wp_get_attachment_url( get_post_thumbnail_id() );
					$image = get_the_post_thumbnail( $post->ID, apply_filters( 'single_product_large_thumbnail_size', 'shop_single' ), array(
						'title' => $image_title,
						'alt' => $image_title
							) );

					$attachment_count = count( $product->get_gallery_attachment_ids() );

					if ( $attachment_count > 0 ) {
						$gallery = '[product-gallery]';
					} else {
						$gallery = '';
					}

					echo apply_filters( 'woocommerce_single_product_image_html', sprintf( '<a href="%s" itemprop="image" class="woocommerce-main-image zoom" title="%s" data-rel="prettyPhoto' . $gallery . '">%s</a>', $image_link, $image_caption, $image ), $post->ID );
				} else {
					echo apply_filters( 'woocommerce_single_product_image_html', sprintf( '<img src="%s" alt="%s" />', wc_placeholder_img_src(), __( 'Placeholder', 'woocommerce' ) ), $post->ID );
				}

				$this->woo_svi_images_thumbs();
				?>
			</div>
			<?php
		}

		function woo_svi_images_thumbs() {
			global $post, $product, $woocommerce;

			$attachment_ids = $product->get_gallery_attachment_ids();

			if ( $attachment_ids ) {
				$loop = 0;
				$columns = apply_filters( 'woocommerce_product_thumbnails_columns', 3 );
				?>
				<div class="thumbnails <?php echo 'columns-' . $columns; ?>"><?php
					foreach ( $attachment_ids as $attachment_id ) {

						$classes = array( '' );

						$image_link = wp_get_attachment_url( $attachment_id );

						if ( !$image_link )
							continue;

						$image = wp_get_attachment_image( $attachment_id, apply_filters( 'single_product_small_thumbnail_size', 'shop_thumbnail' ) );
						$image_class = esc_attr( implode( ' ', $classes ) );
						$image_title = esc_attr( get_the_title( $attachment_id ) );

						echo apply_filters( 'woocommerce_single_product_image_thumbnail_html', sprintf( '<a href="%s" class="%s" title="%s">%s</a>', $image_link, $image_class, $image_title, $image ), $attachment_id, $post->ID, $image_class );

						$loop++;
					}
					?>
				</div>
				<?php
			}
		}

		/**
		 * Add woovsi field to media uploader
		 *
		 * @param $form_fields array, fields to include in attachment form
		 * @param $post object, attachment record in database
		 * @return $form_fields, modified form fields
		 */
		function woo_svi_field( $form_fields, $post ) {
			if ( isset( $_POST['post_id'] ) && $_POST['post_id'] != '0' ) {
				$att = wc_get_attribute_taxonomy_names();
				if ( !empty( $att ) ) {

					$current = get_post_meta( $post->ID, 'woosvi_slug', true );

					$html = "<select name='attachments[{$post->ID}][woosvi-slug]' id='attachments[{$post->ID}][woosvi-slug]'>";

					$variations = true;

					foreach ( $att as $value ) {
						$html .="<option value='' " . selected( $current, '', false ) . ">none</option>";

						$fabric_values = get_the_terms( $_POST['post_id'], $value );

						if ( !empty( $fabric_values ) ) {
							foreach ( $fabric_values as $fabric_value ) {
								$html .="<option value='" . $fabric_value->slug . "' " . selected( $current, $fabric_value->slug, false ) . ">" . $fabric_value->name . "</option>";
							}
						} else {
							$variations = false;
						}
					}

					$html .='</select>';

					if ( $variations ) {
						$form_fields['woosvi-slug'] = array(
							'label' => 'Variation Slug',
							'input' => 'html',
							'html' => $html,
							'application' => 'image',
							'exclusions' => array( 'audio', 'video' ),
							'helps' => 'Choose the variation Slug',
						);
					}
				}
			}
			return $form_fields;
		}

		/**
		 * Save values of woovsi in media uploader
		 *
		 * @param $post array, the post data for database
		 * @param $attachment array, attachment fields from $_POST form
		 * @return $post array, modified post data
		 */
		function woo_svi_field_save( $post, $attachment ) {
			if ( isset( $attachment['woosvi-slug'] ) )
				update_post_meta( $post['ID'], 'woosvi_slug', $attachment['woosvi-slug'] );


			return $post;
		}

		function add_woovsi_attribute( $html, $post ) {
			$current = get_post_meta( $post->ID, 'woosvi_slug', true );

			$html['data-woovsi'] = $current;

			return $html;
		}

	}

	function woo_svi() {
		global $woo_svi;

		if ( !isset( $woo_svi ) ) {
			$woo_svi = new woo_svi();
		}

		return $woo_svi;
	}

// initialize
	woo_svi();
endif;
