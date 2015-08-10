(function ($, window, document, undefined) {

    $.fn.wc_variation_form = function () {

        $.fn.wc_variation_form.find_matching_variations = function (product_variations, settings) {
            var matching = [];

            for (var i = 0; i < product_variations.length; i++) {
                var variation = product_variations[i];
                var variation_id = variation.variation_id;

                if ($.fn.wc_variation_form.variations_match(variation.attributes, settings)) {
                    matching.push(variation);
                }
            }

            return matching;
        };

        $.fn.wc_variation_form.variations_match = function (attrs1, attrs2) {
            var match = true;

            for (var attr_name in attrs1) {
                if (attrs1.hasOwnProperty(attr_name)) {
                    var val1 = attrs1[ attr_name ];
                    var val2 = attrs2[ attr_name ];

                    if (val1 !== undefined && val2 !== undefined && val1.length !== 0 && val2.length !== 0 && val1 !== val2) {
                        match = false;
                    }
                }
            }

            return match;
        };

        // Unbind any existing events
        this.unbind('check_variations update_variation_values found_variation');
        this.find('.reset_variations').unbind('click');
        this.find('.variations select').unbind('change focusin');

        WOOSVI.STARTS.galleryPopulate();  //WOO_SVI SHOW ONLY CORRESPONDING IMAGES
        WOOSVI.STARTS.galleryProduct();  //WOO_SVI SWITCH PRMARY IMAGE
        // Bind events
        $form = this
                // On clicking the reset variation button
                .on('click', '.reset_variations', function (event) {

                    $(this).closest('.variations_form').find('.variations select').val('').change();

                    var $sku = $(this).closest('.product').find('.sku'),
                            $weight = $(this).closest('.product').find('.product_weight'),
                            $dimensions = $(this).closest('.product').find('.product_dimensions');

                    if ($sku.attr('data-o_sku'))
                        $sku.text($sku.attr('data-o_sku'));

                    if ($weight.attr('data-o_weight'))
                        $weight.text($weight.attr('data-o_weight'));

                    if ($dimensions.attr('data-o_dimensions'))
                        $dimensions.text($dimensions.attr('data-o_dimensions'));

                    $(this).closest('.variations_form').trigger('reset_image');

                    return false;
                })

                // Upon changing an option
                .on('change', '.variations select', function (event) {

                    $variation_form = $(this).closest('.variations_form');

                    if ($variation_form.find('input.variation_id').length > 0)
                        $variation_form.find('input.variation_id').val('').change();
                    else
                        $variation_form.find('input[name=variation_id]').val('').change();

                    $variation_form
                            .trigger('woocommerce_variation_select_change')
                            .trigger('check_variations', ['', false]);

                    $(this).blur();

                    if ($().uniform && $.isFunction($.uniform.update)) {
                        $.uniform.update();
                    }

                    // Custom event for when variation selection has been changed
                    $variation_form.trigger('woocommerce_variation_has_changed');

                    if ($(this).val() != '') {
                        var variation = {
                            'attributes':
                                    {'att': $(this).val()}
                        };
                        WOOSVI.STARTS.galleryDefault(variation);
                    }
                })

                // Upon gaining focus
                .on('focusin touchstart', '.variations select', function (event) {

                    $variation_form = $(this).closest('.variations_form');

                    // Get attribute name from data-attribute_name, or from input name if it doesn't exist
                    if (typeof ($(this).data('attribute_name')) != 'undefined')
                        attribute_name = $(this).data('attribute_name');
                    else
                        attribute_name = $(this).attr('name');

                    $variation_form
                            .trigger('woocommerce_variation_select_focusin')
                            .trigger('check_variations', [attribute_name, true]);

                })

                // Check variations
                .on('check_variations', function (event, exclude, focus) {

                    var all_set = true,
                            any_set = false,
                            showing_variation = false,
                            current_settings = {},
                            $variation_form = $(this),
                            $reset_variations = $variation_form.find('.reset_variations');

                    $variation_form.find('.variations select').each(function () {

                        // Get attribute name from data-attribute_name, or from input name if it doesn't exist
                        if (typeof ($(this).data('attribute_name')) != 'undefined')
                            attribute_name = $(this).data('attribute_name');
                        else
                            attribute_name = $(this).attr('name');


                        if ($(this).val().length === 0) {
                            all_set = false;
                        } else {
                            any_set = true;
                        }

                        if (exclude && attribute_name === exclude) {

                            all_set = false;
                            current_settings[ attribute_name ] = '';

                        } else {

                            // Encode entities
                            value = $(this).val();

                            // Add to settings array
                            current_settings[ attribute_name ] = value;
                        }

                    });

                    var product_id = parseInt($variation_form.data('product_id')),
                            all_variations = $variation_form.data('product_variations');

                    // Fallback to window property if not set - backwards compat
                    if (!all_variations)
                        all_variations = window.product_variations.product_id;
                    if (!all_variations)
                        all_variations = window.product_variations;
                    if (!all_variations)
                        all_variations = window['product_variations_' + product_id ];

                    var matching_variations = $.fn.wc_variation_form.find_matching_variations(all_variations, current_settings);

                    if (all_set) {

                        var variation = matching_variations.shift();

                        if (variation) {

                            // Found - set ID

                            // Get variation input by class, or by input name if class doesn't exist
                            if ($variation_form.find('input.variation_id').length > 0)
                                $variation_input = $variation_form.find('input.variation_id');
                            else
                                $variation_input = $variation_form.find('input[name=variation_id]');

                            // Set ID
                            $variation_input
                                    .val(variation.variation_id)
                                    .change();



                            $variation_form.trigger('found_variation', [variation]);

                        } else {

                            // Nothing found - reset fields
                            $variation_form.find('.variations select').val('');

                            if (!focus)
                                $variation_form.trigger('reset_image');

                            alert(woo_svijs_params.i18n_no_matching_variations_text);

                        }

                    } else {

                        $variation_form.trigger('update_variation_values', [matching_variations]);

                        if (!exclude) {
                            $variation_form.find('.single_variation_wrap').slideUp(200).trigger('hide_variation');
                        }

                    }

                    if (any_set) {

                        /*if ($reset_variations.css('visibility') === 'hidden')
                         $reset_variations.css('visibility', 'visible').hide().fadeIn();*/

                    } else {

                        $reset_variations.css('visibility', 'hidden');
                        $sku = $(this).closest('.product').find('.sku');
                        $sku.text($sku.attr('data-o_sku'));

                    }

                })

                // Reset product image
                .on('reset_image', function (event) {

                    var $product = $(this).closest('.product'),
                            $product_img = $product.find('div.woosvi_images img:eq(0), div.images img:eq(0)'),
                            $product_link = $product.find('div.woosvi_images a.zoom:eq(0),div.images a.zoom:eq(0)'),
                            o_src = $product_img.attr('data-o_src'),
                            o_title = $product_img.attr('data-o_title'),
                            o_alt = $product_img.attr('data-o_alt'),
                            o_href = $product_link.attr('data-o_href');

                    if (o_src !== undefined) {
                        $product_img
                                .attr('src', o_src);
                    }

                    if (o_href !== undefined) {
                        $product_link
                                .attr('href', o_href);
                    }

                    if (o_title !== undefined) {
                        $product_img
                                .attr('title', o_title);
                        $product_link
                                .attr('title', o_title);
                    }

                    if (o_alt !== undefined) {
                        $product_img
                                .attr('alt', o_alt);
                    }

                    WOOSVI.STARTS.galleryPopulate();

                    if ($("div.woosvi_images.woosvilens").length > 0 && o_href !== undefined)
                        WOOSVI.STARTS.imgGalreset(o_href);

                })

                // Disable option fields that are unavaiable for current set of attributes
                .on('update_variation_values', function (event, variations) {

                    $variation_form = $(this).closest('.variations_form');

                    // Loop through selects and disable/enable options based on selections
                    $variation_form.find('.variations select').each(function (index, el) {

                        current_attr_select = $(el);

                        // Reset options
                        if (!current_attr_select.data('attribute_options'))
                            current_attr_select.data('attribute_options', current_attr_select.find('option:gt(0)').get());

                        current_attr_select.find('option:gt(0)').remove();
                        current_attr_select.append(current_attr_select.data('attribute_options'));
                        current_attr_select.find('option:gt(0)').removeClass('attached');

                        current_attr_select.find('option:gt(0)').removeClass('enabled');
                        current_attr_select.find('option:gt(0)').removeAttr('disabled');

                        // Get name from data-attribute_name, or from input name if it doesn't exist
                        if (typeof (current_attr_select.data('attribute_name')) != 'undefined')
                            current_attr_name = current_attr_select.data('attribute_name');
                        else
                            current_attr_name = current_attr_select.attr('name');

                        // Loop through variations
                        for (var num in variations) {

                            if (typeof (variations[ num ]) != 'undefined') {

                                var attributes = variations[ num ].attributes;

                                for (var attr_name in attributes) {
                                    if (attributes.hasOwnProperty(attr_name)) {
                                        var attr_val = attributes[ attr_name ];

                                        if (attr_name == current_attr_name) {

                                            if (variations[ num ].variation_is_active)
                                                variation_active = 'enabled';
                                            else
                                                variation_active = '';

                                            if (attr_val) {

                                                // Decode entities
                                                attr_val = $('<div/>').html(attr_val).text();

                                                // Add slashes
                                                attr_val = attr_val.replace(/'/g, "\\'");
                                                attr_val = attr_val.replace(/"/g, "\\\"");

                                                // Compare the meerkat
                                                current_attr_select.find('option[value="' + attr_val + '"]').addClass('attached ' + variation_active);

                                            } else {

                                                current_attr_select.find('option:gt(0)').addClass('attached ' + variation_active);

                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Detach unattached
                        current_attr_select.find('option:gt(0):not(.attached)').remove();

                        // Grey out disabled
                        current_attr_select.find('option:gt(0):not(.enabled)').attr('disabled', 'disabled');

                    });

                    // Custom event for when variations have been updated
                    $variation_form.trigger('woocommerce_update_variation_values');

                })

                // Show single variation details (price, stock, image)
                .on('found_variation', function (event, variation) {
                    var $woosvi;

                    $woosvi = WOOSVI.STARTS.galleryDefault(variation);  //WOO_SVI run gallery swap image

                    var $variation_form = $(this),
                            $product = $(this).closest('.product'),
                            $product_img = $product.find('div.woosvi_images img:eq(0),div.images img:eq(0)'),
                            $product_link = $product.find('div.woosvi_images a:eq(0),div.images a.zoom:eq(0)'),
                            o_src = $product_img.attr('data-o_src'),
                            o_title = $product_img.attr('data-o_title'),
                            o_alt = $product_img.attr('data-o_alt'),
                            o_href = $product_link.attr('data-o_href'),
                            variation_image = variation.image_src,
                            variation_link = variation.image_link,
                            variation_title = variation.image_title,
                            variation_alt = variation.image_alt;

                    if (!$woosvi) {
                        if (variation_image && variation_image.length > 1) {
                            $product_img
                                    .attr('src', variation_image)
                                    .attr('alt', variation_alt)
                                    .attr('title', variation_title);
                            $product_link
                                    .attr('href', variation_link)
                                    .attr('title', variation_title);
                        } else {
                            $product_img
                                    .attr('src', o_src)
                                    .attr('alt', o_alt)
                                    .attr('title', o_title);
                            $product_link
                                    .attr('href', o_href)
                                    .attr('title', o_title);
                        }
                        if ($("div.woosvi_images.woosvilens").length > 0)
                            WOOSVI.STARTS.imgGalreset(variation_image);
                    }
                    $variation_form.find('.variations_button').show();
                    $variation_form.find('.single_variation').html(variation.price_html + variation.availability_html);

                    var $single_variation_wrap = $variation_form.find('.single_variation_wrap'),
                            $sku = $product.find('.product_meta').find('.sku'),
                            $weight = $product.find('.product_weight'),
                            $dimensions = $product.find('.product_dimensions');

                    if (!$sku.attr('data-o_sku'))
                        $sku.attr('data-o_sku', $sku.text());

                    if (!$weight.attr('data-o_weight'))
                        $weight.attr('data-o_weight', $weight.text());

                    if (!$dimensions.attr('data-o_dimensions'))
                        $dimensions.attr('data-o_dimensions', $dimensions.text());

                    if (variation.sku) {
                        $sku.text(variation.sku);
                    } else {
                        $sku.text($sku.attr('data-o_sku'));
                    }

                    if (variation.weight) {
                        $weight.text(variation.weight);
                    } else {
                        $weight.text($weight.attr('data-o_weight'));
                    }

                    if (variation.dimensions) {
                        $dimensions.text(variation.dimensions);
                    } else {
                        $dimensions.text($dimensions.attr('data-o_dimensions'));
                    }

                    $single_variation_wrap.find('.quantity').show();

                    if (!variation.is_purchasable || !variation.is_in_stock || !variation.variation_is_visible) {
                        $variation_form.find('.variations_button').hide();
                    }

                    if (!variation.variation_is_visible) {
                        $variation_form.find('.single_variation').html('<p>' + woo_svijs_params.i18n_unavailable_text + '</p>');
                    }

                    if (variation.min_qty !== '')
                        $single_variation_wrap.find('.quantity input.qty').attr('min', variation.min_qty).val(variation.min_qty);
                    else
                        $single_variation_wrap.find('.quantity input.qty').removeAttr('min');

                    if (variation.max_qty !== '')
                        $single_variation_wrap.find('.quantity input.qty').attr('max', variation.max_qty);
                    else
                        $single_variation_wrap.find('.quantity input.qty').removeAttr('max');

                    if (variation.is_sold_individually === 'yes') {
                        $single_variation_wrap.find('.quantity input.qty').val('1');
                        $single_variation_wrap.find('.quantity').hide();
                    }

                    $single_variation_wrap.slideDown(200).trigger('show_variation', [variation]);

                });

        $form.trigger('wc_variation_form');

        return $form;
    };

    $(function () {

        // woo_svijs_params is required to continue, ensure the object exists
        if (typeof woo_svijs_params === 'undefined')
            return false;

        $('.variations_form').wc_variation_form();
        $('.variations_form .variations select').change();
    });

})(jQuery, window, document);

if (!WOOSVI) {
    var WOOSVI = {}
} else {
    if (WOOSVI && typeof WOOSVI !== "object") {
        throw new Error("WOOSVI is not an Object type")
    }
}
WOOSVI.isLoaded = false;
WOOSVI.STARTS = function ($) {
    return{NAME: "Application initialize module", VERSION: 0.6, init: function () {
            this.loadInits();
            this.imgGal();
        }, loadInits: function () {
            if ($("div.woosvi_images").length > 0)
                $('body.single-product div.product div.images').remove();
        },
        galleryProduct: function () {
            $("div.woosvi_images .thumbnails a[rel^='prettyPhoto'], div.images .thumbnails a.zoom").unbind('click').on('click', function (event) {
                event.preventDefault();
            });
            $(".thumbnails a").on('click', function (event) {
                event.preventDefault();
                $(".thumbnails img").removeClass("current_p_thumb");
                $(this).find("img").addClass("current_p_thumb");
                var photo_fullsize = $(this).attr("href");
                $(".woocommerce-main-image img").attr("src", photo_fullsize);
                if ($("div.woosvi_images.woosvilens").length > 0)
                    WOOSVI.STARTS.imgGalreset(photo_fullsize);
            });
        },
        galleryPopulate: function () {
            var $primary, str, count;

            $primary = $('div.woosvi_images>a>img,div.images>a>img').data('woovsi');

            if (typeof $primary !== "undefined") {
                count = 1;
                $("div.woosvi_images div.thumbnails a,div.images div.thumbnails a").each(function (i, v) {
                    $(this).find("img").removeClass("current_p_thumb");
                    str = $(this).find("img").data("woovsi").toLowerCase();
                    if (str === $primary && str !== '') {
                        $(this).show();
                        $(this).removeClass("last");

                        if (count === 1) {
                            $(this).addClass('first');
                            $(this).find("img").addClass("current_p_thumb");
                            count = count + 1
                        }

                    } else {
                        $(this).find("img").removeClass("current_p_thumb");
                        $(this).hide()
                    }
                })
            }
            $('.woosvi_images .thumbnails.hidden').removeClass('hidden');
        },
        galleryDefault: function ($elm) {
            var $color, count;
            var $woosvi = false;
            var imgHeight = $("div.woosvi_images img:eq(0),div.images img:eq(0)").height() + 'px';
            var imgWidth = $("div.woosvi_images img:eq(0),div.images img:eq(0)").width() + 'px';
            $('a.woocommerce-main-image').css('display', 'inline-block').height(imgHeight).width(imgWidth);

            $('.variations select').bind('change');

            $('.woosvi_images .thumbnails.hidden').removeClass('hidden');

            $.each($elm.attributes, function (i, v) {

                $color = v;

                if ($color !== '' && $('a>img[data-woovsi="' + $color + '"]').length > 0) {

                    count = 1;

                    /*if ($color !== $("div.woosvi_images img:eq(0),div.images img:eq(0)").attr('title').toLowerCase())
                     $("div.woosvi_images img:eq(0),div.images img:eq(0)").fadeOut("fast");*/

                    $("div.woosvi_images div.thumbnails a,div.images div.thumbnails a").each(function (i, v) {
                        var strColor = $(this).find("img").data("woovsi").toLowerCase();
                        $(this).removeClass("last").removeClass("first");
                        if (strColor === $color) {
                            $woosvi = true;
                            if (count === 1) {
                                $(this).addClass("first");
                                var image_src = $(this).attr("href");
                                var image_link = $(this).attr("href");
                                var image_title = $(this).find("img").data("woovsi").toLowerCase();
                                $(this).find("img").addClass("current_p_thumb");
                                var variation = {image_src: image_src, image_link: image_link, image_title: image_title};

                                WOOSVI.STARTS.swap_image(variation);

                                count = count + 1;
                            }
                            $(this).show();
                        } else {
                            $(this).find("img").removeClass("current_p_thumb");
                            $(this).hide();
                        }
                    })
                }
            })
            return $woosvi;
        },
        swap_image: function (variation) {
            var img = $("div.woosvi_images img:eq(0),div.images img:eq(0)");
            var link = $("div.woosvi_images a:eq(0),div.images a:eq(0)");
            var o_src = $(img).attr("data-o_src");
            var o_title = $(img).attr("data-o_title");
            var o_href = $(link).attr("data-o_href");
            var variation_image = variation.image_src;
            var variation_link = variation.image_link;
            var variation_title = variation.image_title;
            if (!o_src) {
                $(img).attr("data-o_src", $(img).attr("src"))
            }
            if (!o_title) {
                $(img).attr("data-o_title", $(img).attr("title"))
            }
            if (!o_href) {
                $(link).attr("data-o_href", $(link).attr("href"))
            }
            $(img).attr("data-woovsi", variation_title);

            $(img).attr("src", variation_image);
            $(img).attr("title", variation_title);
            $(img).attr("alt", variation_title);
            $(link).attr("href", variation_link);
            $(link).attr("title", variation_title);
            //$("div.woosvi_images img:eq(0),div.images img:eq(0)").fadeIn();
            if ($("div.woosvi_images.woosvilens").length > 0)
                WOOSVI.STARTS.imgGalreset(variation_image);
        },
        imgGal: function () {
            if ($("div.woosvi_images.woosvilens").length > 0)
                $("div.woosvi_images img:eq(0)").elevateZoom({zoomType: "lens", lensShape: "round", lensSize: 200, galleryActiveClass: "current_p_thumb", gallery: "div.woosvi_images div.thumbnails"});
        },
        imgGalreset: function (variation_image) {
            var ez = $("div.woosvi_images img:eq(0)").data('elevateZoom');

            ez.swaptheimage(variation_image, variation_image);
        }
    }
}(jQuery);
jQuery(document).ready(function () {
    WOOSVI.STARTS.init()
});

