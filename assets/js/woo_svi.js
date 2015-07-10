if (!WOOSVI) {
    var WOOSVI = {}
} else {
    if (WOOSVI && typeof WOOSVI !== "object") {
        throw new Error("WOOSVI is not an Object type")
    }
}
WOOSVI.isLoaded = false;
WOOSVI.STARTS = function ($) {
    return{NAME: "Application initialize module", VERSION: 1.3, init: function () {
            this.loadInits();
            this.galleryProduct();
            this.galleryDefault()
        }, loadInits: function () {
        }, galleryProduct: function () {
            $(".thumbnails a.zoom[data-rel^='prettyPhoto']").unbind("click");
            $(".thumbnails a.zoom").click(function (e) {
                e.preventDefault();
                $(".thumbnails .zoom img").removeClass("current_p_thumb");
                $(this).find("img").addClass("current_p_thumb");
                var photo_fullsize = $(this).attr("href");
                $(".woocommerce-main-image img").attr("src", photo_fullsize)
            });
            $(".woocommerce-main-image").click(function (e) {
                e.preventDefault()
            })
        }, galleryDefault: function () {
            var $primary, $color, str, count, $select;
            $select = $(".variations select");
            $primary = $select.val();
            if (typeof $primary !== "undefined") {
                count = 1;
                $("div.images div.thumbnails a").each(function (i, v) {
                    $(this).find("img").removeClass("current_p_thumb");
                    str = $(this).find("img").data("woovsi").toLowerCase();
                    if (str === $primary) {
                        $(this).show();
                        if (count === 1) {
                            $(this).find("img").addClass("current_p_thumb");
                            count = count + 1
                        }
                    } else {
                        $(this).hide()
                    }
                })
            }
            var img = $("div.images img:eq(0)");
            var link = $("div.images a.zoom:eq(0)");
            var o_src = $(img).attr("data-o_src");
            var o_title = $(img).attr("data-o_title");
            var o_href = $(link).attr("data-o_href");
            $select.click(function (e) {
                if (e.target.tagName === "OPTION") {
                    $("div.images img:eq(0)").fadeOut("fast");
                    count = 1;
                    $color = e.target.value;
                    $("div.images div.thumbnails a").each(function (i, v) {
                        var strColor = $(this).find("img").data("woovsi").toLowerCase();
                        if (strColor === $color) {
                            if (count === 1) {
                                var image_src = $(this).attr("href");
                                var image_link = $(this).attr("href");
                                var image_title = $(this).find("img").data("woovsi").toLowerCase();
                                $(this).find("img").addClass("current_p_thumb");
                                var variation = {image_src: image_src, image_link: image_link, image_title: image_title};
                                setTimeout(function () {
                                    WOOSVI.STARTS.swap_image(variation)
                                }, 50);
                                count = count + 1
                            }
                            $(this).show()
                        } else {
                            $(this).hide()
                        }
                    })
                }
            })
        }, swap_image: function (variation) {
            var img = $("div.images img:eq(0)");
            var link = $("div.images a.zoom:eq(0)");
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
            $("div.images img:eq(0)").fadeIn()
        }}
}(jQuery);
jQuery(document).ready(function () {
    WOOSVI.STARTS.init()
});