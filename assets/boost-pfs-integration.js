var boostPFSIntegrationTemplate = {
  compileTemplate: {
    reviews: "var itemReviewsHtml = '<div class=\"wc_product_review_badge_boostcommerce\" data-handle=\"' + data.handle + '\" data-product_id =\"' + data.id + '\"></div>';itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewsHtml);"
  },
  call3rdFunction: {
    reviews: var xhr = new XMLHttpRequest();
      var data = 'shop=' + ajax_shop_badge_url;
      for(var i = 0; i < ajax_product_handle.length; i++) {
		data += '&product_handles[]=' + ajax_product_handle[i]
      }
      xhr.open("POST", "//thimatic-apps.com/product_review/get_review_rating_update.php");
   	  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      xhr.onload = function() {
        try {
          var result = JSON.parse(xhr.responseText);

          if (xhr.readyState > 3) {
            if (xhr.status == 200) {
              // On success
              jQ(".wc_product_review_badge_boostcommerce").html(result.empty.html);
              jQ.each(result, function (key, value) {
                jQ(
                  '.wc_product_review_badge_boostcommerce[data-handle="' +
                    key +
                    '"]'
                ).html(value.html);
              });
            } else {
              // On error
              console.log(result);
            }
          }
        } catch(e) {
		  console.log(e)
        }
      }
      xhr.send(data)"
  }
};