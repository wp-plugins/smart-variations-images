if (!WOOSVI) {
    var WOOSVI = {}
} else {
    if (WOOSVI && typeof WOOSVI !== "object") {
        throw new Error("WOOSVI is not an Object type")
    }
}
WOOSVI.isLoaded = false;
WOOSVI.STARTS = function ($) {
    return{NAME: "Application initialize module", VERSION: 0.4, init: function () {
            this.loadInits();
            this.galleryPopulate();
            this.galleryProduct();
            this.galleryDefault();
            this.imgGal();
            this.resetVariation();
        }, loadInits: function () {
            if ($("div.woosvi_images").length > 0)
                $('body.single-product div.product div.images').remove();
        },
        resetVariation: function () {

            $('form.variations_form').on('click', '.reset_variations', function (e) {
                setTimeout(function () {
                    WOOSVI.STARTS.galleryPopulate();
                    WOOSVI.STARTS.redomainimage();
                }, 300);
            })
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

            $primary = $('div.woosvi_images a:visible img:eq(0),div.images :visible img:eq(0)').data('woovsi');
            console.log($primary);
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
        },
        galleryDefault: function () {
            var $color, count;

            var imgHeight = $("div.woosvi_images img:eq(0),div.images img:eq(0)").height() + 'px';
            var imgWidth = $("div.woosvi_images img:eq(0),div.images img:eq(0)").width() + 'px';
            $('a.woocommerce-main-image').css('display', 'inline-block').height(imgHeight).width(imgWidth);

            $('.variations select').bind('change');

            $('.woosvi_images .thumbnails.hidden').removeClass('hidden');

            $('form.variations_form').on('change', '.variations select', function (e) {
                e.preventDefault();
                $color = $(this).val();

                if ($color !== '' && $('a>img[data-woovsi="' + $color + '"]').length > 0) {

                    count = 1;
                    $("div.woosvi_images img:eq(0),div.images img:eq(0)").fadeOut("fast");
                    $("div.woosvi_images div.thumbnails a,div.images div.thumbnails a").each(function (i, v) {
                        var strColor = $(this).find("img").data("woovsi").toLowerCase();
                        $(this).removeClass("last").removeClass("first");
                        if (strColor === $color) {
                            if (count === 1) {
                                $(this).addClass("first");
                                var image_src = $(this).attr("href");
                                var image_link = $(this).attr("href");
                                var image_title = $(this).find("img").data("woovsi").toLowerCase();
                                $(this).find("img").addClass("current_p_thumb");
                                var variation = {image_src: image_src, image_link: image_link, image_title: image_title};
                                setTimeout(function () {
                                    WOOSVI.STARTS.swap_image(variation);
                                }, 100);
                                count = count + 1
                            }
                            $(this).show()
                        } else {
                            $(this).find("img").removeClass("current_p_thumb");
                            $(this).hide()
                        }
                    })
                } else {
                    if ($color !== '') {
                        WOOSVI.STARTS.redomainimage();
                    }

                }
            })
        },
        redomainimage: function () {
            $("div.woosvi_images img:eq(0),div.images img:eq(0)").fadeOut();

            $color = $("div.woosvi_images div.thumbnails a img.current_p_thumb,div.images div.thumbnails a img.current_p_thumb").data('woovsi');

            var image_src = $("div.woosvi_images div.thumbnails a img.current_p_thumb,div.images div.thumbnails a img.current_p_thumb").closest('a').attr("href");
            var image_link = $("div.woosvi_images div.thumbnails a img.current_p_thumb,div.images div.thumbnails a img.current_p_thumb").closest('a').attr("href");
            var image_title = $color;
            var variation = {image_src: image_src, image_link: image_link, image_title: image_title};
            setTimeout(function () {
                WOOSVI.STARTS.swap_image(variation);
            }, 100);
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
            var timestamp = new Date().getTime();
            $(img).attr("src", variation_image + "?" + timestamp);
            $(img).attr("title", variation_title);
            $(img).attr("alt", variation_title);
            $(link).attr("href", variation_link + "?" + timestamp);
            $(link).attr("title", variation_title);
            $("div.woosvi_images img:eq(0),div.images img:eq(0)").fadeIn();
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

