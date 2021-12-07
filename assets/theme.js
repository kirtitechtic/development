var pixelRatio = !!window.devicePixelRatio ? window.devicePixelRatio : 1;
window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
  .on('shopify:section:load', this._onSectionLoad.bind(this))
  .on('shopify:section:unload', this._onSectionUnload.bind(this))
  .on('shopify:section:select', this._onSelect.bind(this))
  .on('shopify:section:deselect', this._onDeselect.bind(this))
  .on('shopify:block:select', this._onBlockSelect.bind(this))
  .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (_.isUndefined(constructor)) {
      return;
    }

    var instance = _.assignIn(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);
  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    if (container) {
      this._createInstance(container);
    }
  },

  _onSectionUnload: function(evt) {
    this.instances = _.filter(this.instances, function(instance) {
      var isEventInstance = (instance.id === evt.detail.sectionId);

      if (isEventInstance) {
        if (_.isFunction(instance.onUnload)) {
          instance.onUnload(evt);
        }
      }

      return !isEventInstance;
    });
  },

  _onSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
      instance.onDeselect(evt);
    }
  },

  _onBlockSelect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    // eslint-disable-next-line no-shadow
    var instance = _.find(this.instances, function(instance) {
      return instance.id === evt.detail.sectionId;
    });

    if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

/* ================ SECTION ================ */

window.theme = window.theme || {}; 
theme.Slideshow = (function(){
  this.$container = null;
  function slideshow(el){
    this.$container = $(el);
    if(this.$container.hasClass('owl-carousel')){
      var data_carousel = this.$container.parent().find('.data-slideshow');
      if(data_carousel.data('auto')) {
        var autoplay = true;
        var autoplayTime = data_carousel.data('auto');
      }else{
        var autoplay = false;
        var autoplayTime = 5000;
      }
      if(data_carousel.data('transition') == 'fade' && data_carousel.data('transition') != ''){
        var transition = 'fadeOut';
      }else {
        var transition = false;
      }
      this.$container.owlCarousel({
        items: 1,
        smartSpeed: 500,
        autoplay: autoplay,
        lazyLoad: true,
        loop: this.$container.children().length > 1,
        autoplayTimeout:autoplayTime,
        autoplayHoverPause: true,
        animateOut: transition,
        dots: data_carousel.data('paging'),
        dotsData: data_carousel.data('dots'),
        nav: data_carousel.data('nav'),
        navText: [data_carousel.data('prev'),data_carousel.data('next')],
        thumbs: true,
        thumbImage: false,
        thumbsPrerendered: true,
        thumbContainerClass: 'owl-thumbs',
        thumbItemClass: 'owl-thumb-item',
        onTranslated: function() {
          $('.owl-item.active').find('video').each(function() {
            this.play();
          });
        },
        onTranslate: function() {
          $('.owl-item').find('video').each(function() {
            this.pause();
          });
        }
      });
    }
    if(this.$container.parents(".full-screen-slider").length > 0) {
      fullScreenInit();
      $(window).resize( function() {
        fullScreenInit();
      });
    }
  } 
  function fullScreenInit(){
    var s_width = $(window).innerWidth();
    var s_height = $(window).innerHeight(); 
    $(".full-screen-slider div.item").css("position","relative");
    $(".full-screen-slider div.item").css("overflow","hidden");
    $(".full-screen-slider div.item").width(s_width);
    $(".full-screen-slider div.item").height(s_height); 
  }
  return slideshow;
})(); 
theme.slideshows = {};
theme.SlideshowSection = (function() {
  function SlideshowSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var slideshow = this.slideshow = '#slideshow-section-' + sectionId;
    theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
  }
  return SlideshowSection;
})();
theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
  onUnload: function() {
    delete theme.slideshows[this.slideshow];
  }
}); 
theme._featuredCategories = (function(){
  this.$container = null;
  function slideInit(el){
    this.$container = $(el);
    if(this.$container.find('.owl-carousel').length > 0){
      carouselSlider(this.$container.find('.owl-carousel'));
    }
    if (typeof($.fn.isotope) == 'undefined' || typeof($.fn.imagesLoaded) == 'undefined') return;
    var $container = $('.elements-grid.grid-masonry');
    // initialize Masonry after all images have loaded
    $container.imagesLoaded(function() {
      $container.isotope({
        isOriginLeft: ! $('body').hasClass('rtl'),
        itemSelector: '.category-grid-item',
      });
    }); 
    // Categories masonry
    masonryInit();
    $(window).resize(function() {
      masonryInit();
    });
  }
  function masonryInit(){
    var $catsContainer = $('.categories-masonry');
    var colWidth = ( $catsContainer.hasClass( 'categories-style-masonry' ) )  ? '.category-grid-item' : '.col-md-3.category-grid-item' ;
    $catsContainer.imagesLoaded(function() {
      $catsContainer.isotope({
        resizable: false,
        isOriginLeft: ! $('body').hasClass('rtl'),
        layoutMode: 'packery',
        packery: {
          gutter: 0,
          columnWidth: colWidth
        },
        itemSelector: '.category-grid-item',
        // masonry: {
        // gutter: 0
        // }
      });
    });
  }
  return slideInit;
})(); 
theme.featurecategories = {};
theme.featureCategories = (function(){
  function featureCategories(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var categories = this.featurecategories = '#feature-categories-' + sectionId;
    theme.featurecategories[categories] = new theme._featuredCategories(categories);
  }
  return featureCategories;
})();
theme.featureCategories.prototype = _.assignIn({}, theme.featureCategories.prototype, {
  onUnload: function() {
    delete theme.featurecategories[this.featurecategories];
  }
});
theme._productTab = (function(){
  this.$container = null;
  function tabInit(el){  
    var process = false, 
        $this = $(el),
        $inner = $this.find('.woodmart-tab-content'), 
        cache = []; 
    SW.collection.productHover();
    SW.page.btnsToolTips();
    SW.collection.shopMasonry();
    SW.collection.productsLoadMore(); 
    countDownInit();
    productReview();
    if($this.find('.woodmart-carousel-container').length > 0) {
      var $carousel = $this.find('.woodmart-carousel-container');
      if($carousel.find('.owl-carousel').length > 0){
        carouselSlider($carousel.find('.owl-carousel'));
      }
    }
    if($inner.find('.owl-carousel').length > 0){
      carouselSlider($inner.find('.owl-carousel'));
    }
    if( $inner.find('.owl-carousel').length < 1 ) {
      cache[0] = $inner.html();
    }
    $this.find('.products-tabs-title li').on('click', function(e) {
      e.preventDefault();
      var $this = $(this),
          atts = $this.data('atts'),
          index = $this.index();
      if( process || $this.hasClass('active-tab-title') ) return; process = true;
      loadTab(atts, index, $inner, $this, cache,  function(data) {
        if( data ) {
          $inner.html(data);
          SW.collection.productHover(); 
          SW.collection.quickShop();   
          SW.page.translateBlock('.main-page-wrapper');
          productReview();
          countDownInit();
          woodmart_settings.enableCurrency && currenciesCallbackSpecial(".site-content .products span.money");
          SW.collection.checkWishlist();
          SW.collection.checkCompare();
          SW.page.btnsToolTips();
          SW.collection.shopMasonry();
          SW.collection.productsLoadMore();
          if($inner.find('.owl-carousel').length > 0){
            carouselSlider($inner.find('.owl-carousel'));
          }
          //woodmartThemeModule.countDownTimer();
        }
      }); 
    });
    var $nav = $this.find('.tabs-navigation-wrapper'),
        $subList = $nav.find('ul'),
        time = 300;
    $nav.on('click', '.open-title-menu', function() {
      var $btn = $(this);
      if( $subList.hasClass('list-shown') ) {
        $btn.removeClass('toggle-active');
        $subList.stop().slideUp(time).removeClass('list-shown');
      } else {
        $btn.addClass('toggle-active');
        $subList.addClass('list-shown');
        setTimeout(function() {
          $('body').one('click', function(e) {
            var target = e.target;
            if ( ! $(target).is('.tabs-navigation-wrapper') && ! $(target).parents().is('.tabs-navigation-wrapper')) {
              $btn.removeClass('toggle-active');
              $subList.removeClass('list-shown');
              return false;
            }
          });
        },10);
      }
    }).on('click', 'li', function() {
      var $btn = $nav.find('.open-title-menu'),
          text = $(this).text();
      if( $subList.hasClass('list-shown') ) {
        $btn.removeClass('toggle-active').text(text);
        $subList.removeClass('list-shown');
      }
    }); 
    var loadTab = function(atts, index, holder, btn, cache, callback) {
      btn.parent().find('.active-tab-title').removeClass('active-tab-title');
      btn.addClass('active-tab-title')
      if( cache[index] ) {
        holder.addClass('loading');
        setTimeout(function() {
          callback(cache[index]);
          holder.removeClass('loading');
          process = false;
        }, 300);
        return;
      }
      holder.addClass('loading').parent().addClass('element-loading');
      btn.addClass('loading');
      $.ajax({
        url: atts, 
        dataType: 'html',
        method: 'GET',
        success: function(data) {
          cache[index] = data;
          callback( data );
        },
        error: function(data) {
          console.log('ajax error');
        },
        complete: function() {
          holder.removeClass('loading').parent().removeClass('element-loading');
          btn.removeClass('loading');
          process = false; 
        },
      });
    };
  } 
  return tabInit;
})(); 
theme.producttab = {};
theme.productTab = (function(){
  function productTab(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var ptab = this.producttab = '#product-tab-' + sectionId;
    theme.producttab[ptab] = new theme._productTab(ptab);
  }
  return productTab;
})();
theme.productTab.prototype = _.assignIn({}, theme.productTab.prototype, {
  onUnload: function() {
    delete theme.producttab[this.producttab];
  }
}); 

theme._productGrid = (function(){
  this.$container = null;
  function gridInit(el){  
    var $this = $(el);
    SW.collection.productHover();
    SW.page.btnsToolTips();
    SW.collection.shopMasonry();
    SW.collection.productsLoadMore();  
  } 
  return gridInit;
})(); 
theme.productgrid = {};
theme.productGrid = (function(){
  function productGrid(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var product = this.productgrid = '#product-grid-' + sectionId;
    theme.productgrid[product] = new theme._productGrid(product);
  }
  return productGrid;
})();
theme.productGrid.prototype = _.assignIn({}, theme.productGrid.prototype, {
  onUnload: function() {
    delete theme.productgrid[this.productgrid];
  }
}); 
theme._carouselSlide = (function(){
  this.$container = null;
  function carouselInit(el){
    this.$container = $(el);
    if(this.$container.find('.owl-carousel').length > 0){
      carouselSlider(this.$container.find('.owl-carousel'));
    } 
    SW.collection.productHover();
    SW.page.btnsToolTips();
    productReview();
  }
  return carouselInit;
})(); 
theme.carousel = {};
theme.carouselSlide = (function(){
  function carouselSlide(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var carousel = this.carousel = '#slide_' + sectionId;
    theme.carousel[carousel] = new theme._carouselSlide(carousel);
  }
  return carouselSlide;
})();
theme.carouselSlide.prototype = _.assignIn({}, theme.carouselSlide.prototype, {
  onUnload: function() {
    delete theme.carousel[this.carousel];
  }
}); 
 
theme._videoPoster = (function(){
  this.$container = null;
  function videoInit(el){
    this.$container = $(el);
    this.$container.find( '.woodmart-video-poster-wrapper' ).on( 'click', function() {
      var videoWrapper = $( this ),
          video = videoWrapper.parent().find( 'iframe' ),
          videoScr =  video.attr( 'src' ),
          videoNewSrc = videoScr + '&autoplay=1';

      if  ( videoScr.indexOf( 'vimeo.com' ) + 1 ) {
        videoNewSrc = videoScr + '?autoplay=1';
      }
      video.attr( 'src',videoNewSrc );
      videoWrapper.addClass( 'hidden-poster' );
    })
  }
  return videoInit;
})(); 
theme.video = {};
theme.videoPoster = (function(){
  function videoPoster(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var video = this.video = '#video_poster_' + sectionId;
    theme.video[video] = new theme._videoPoster(video);
  }
  return videoPoster;
})();
theme.videoPoster.prototype = _.assignIn({}, theme.videoPoster.prototype, {
  onUnload: function() {
    delete theme.video[this.video];
  }
}); 

theme._googleMap = (function(){
  this.$container = null;
  function mapInit(el){
    this.$container = $(el);
    var map = this.$container.find('.map-data'); 
    new Maplace({
      locations: [
        {
          lat: map.data('lat'),
          lon: map.data('long'),
          title: map.data('title') != '' ? map.data('title'): '', 
          html: map.data('content')!= '' ? map.data('content'): '',  
          icon: map.data('icon'),
          animation: google.maps.Animation.DROP
        }
      ],
      controls_on_map: false,
      title: map.data('title'),
      map_div: map.data('mapshow'),
      start: 1,
      map_options: {
        zoom: map.data('zoom'),
        scrollwheel: map.data('scrollwheel')
      },
      style: {
        'Custom style': [map.data('json')]
      }
    }).Load();
  }
  return mapInit;
})(); 
theme.map = {};
theme.googleMap = (function(){
  function googleMap(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var map = this.map = '#google-map-' + sectionId;
    theme.map[map] = new theme._googleMap(map);
  }
  return googleMap;
})();
theme.googleMap.prototype = _.assignIn({}, theme.googleMap.prototype, {
  onUnload: function() {
    delete theme.map[this.map];
  }
}); 

theme._instagramSection = (function(){
  this.$container = null;
  function instaInit(el){
    this.$container = $(el);
    if(this.$container.find('.testimonials-slider').length > 0){
      carouselSlider(this.$container.find('.testimonials-slider'));
    } 
    var feed = this.$container.find(".instagram-pics");
    var userID = feed.data('user-id'),
      token = feed.data('access-token'),
      count = feed.data('limit');
    var url = "https://api.instagram.com/v1/users/"+userID+"/media/recent/?access_token="+token; 
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      cache: false,
      url: url,
      success: function(data) {
        var username = data.data[0].user.username;
        $('.insta-name').attr('href', '//instagram.com/'+username);
        for (var i = 0; i < count; i++) {
          if (data.data[i]) {
            var caption = "";
            if (data.data[i].caption) {
              caption = data.data[i].caption.text;
            }
            var instaClone = [
              '<div class="instagram-picture">',
                '<div class="wrapp-picture" style="text-align:center;">',
                  '<a href="'+ data.data[i].link +'" target="_blank"></a>',
                  '<img src="'+ data.data[i].images.low_resolution.url +'" style="display:inline-block;">',
                  '<div class="hover-mask">',
                    '<span class="instagram-likes"><span>'+data.data[i].likes.count+'</span></span>',
                    '<span class="instagram-comments"><span>'+data.data[i].comments.count+'</span></span>',
                  '</div>',
                '</div>',
              '</div>',
            ].join('');  
            feed.append(instaClone); 
            feed.imagesLoaded(function() { 
              if(feed.hasClass('owl-carousel')){
                carouselSlider(feed); 
              }
            }); 
          }
        }
      } 
    });
  }
  return instaInit;
})(); 
theme.instagram = {};
theme.instagramSection = (function(){
  function instagramSection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var instagram = this.instagram = '#instagram-' + sectionId;
    theme.instagram[instagram] = new theme._instagramSection(instagram);
  }
  return instagramSection;
})();
theme.instagramSection.prototype = _.assignIn({}, theme.instagramSection.prototype, {
  onUnload: function() {
    delete theme.instagram[this.instagram];
  }
}); 
        
theme._gallerySection = (function(){
  this.$container = null;
  function galleryInit(el){
    this.$container = $(el);  
    if (typeof($.fn.isotope) == "undefined" || typeof($.fn.imagesLoaded) == "undefined") return;
    var $container = this.$container.find(".gallery-images");
    if(this.$container.hasClass("view-masonry")){
      $container.imagesLoaded(function() {
        $container.isotope({
          gutter: 0,
          isOriginLeft: ! $("body").hasClass("rtl"),
          itemSelector: ".woodmart-gallery-item"
        });
      });
    }
  }
  return galleryInit;
})(); 
theme.gallery = {};
theme.gallerySection = (function(){
  function gallerySection(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var gallery = this.gallery = '#gallery_' + sectionId;
    theme.gallery[gallery] = new theme._gallerySection(gallery);
  }
  return gallerySection;
})();
theme.gallerySection.prototype = _.assignIn({}, theme.gallerySection.prototype, {
  onUnload: function() {
    delete theme.gallery[this.gallery];
  }
}); 
        
theme._promoBanner = (function(){
  this.$container = null;
  function bannerInit(el){
    this.$container = $(el);
    countDownInit();
  }
  return bannerInit;
})(); 
theme.promobanner = {};
theme.promoBanner = (function(){
  function promoBanner(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var promobanner = this.promobanner = '#promobanner_' + sectionId;
    theme.promobanner[promobanner] = new theme._promoBanner(promobanner);
  }
  return promoBanner;
})();
theme.promoBanner.prototype = _.assignIn({}, theme.promoBanner.prototype, {
  onUnload: function() {
    delete theme.promobanner[this.promobanner];
  }
}); 
        
theme._imageHotspot = (function(){
  this.$container = null;
  function hotspotInit(el){
    this.$container = $(el); 
    if(this.$container.find('.owl-carousel').length > 0){
      carouselSlider(this.$container.find('.owl-carousel'));
    } 
    //Hotspot action
    $('.woodmart-image-hotspot').each(function () {
      var _this = $(this);
      var btn = _this.find('.hotspot-btn');
      // var content = _this.find('.hotspot-content');
      var parentWrapper = _this.parents('.woodmart-image-hotspot-wrapper');

      if (!parentWrapper.hasClass('hotspot-action-click') && $(window).width() > 1024) return;

      btn.on('click', function () {
        if (_this.hasClass('hotspot-opened')) {
          _this.removeClass('hotspot-opened');
        } else {
          _this.addClass('hotspot-opened');
          _this.siblings().removeClass('hotspot-opened');
        }
        $(document).trigger('wood-images-loaded');
        return false;
      });

      $(document).click(function (e) {
        var target = e.target;
        if (_this.hasClass('hotspot-opened') && !$(target).is('.woodmart-image-hotspot') && !$(target).parents().is('.woodmart-image-hotspot')) {
          _this.removeClass('hotspot-opened');
          return false;
        }
      });
    });

    //Image loaded
    $('.woodmart-image-hotspot-wrapper').each(function () {
      var _this = $(this);
      _this.imagesLoaded(function () {
        _this.addClass('loaded');
      });
    });

    //Content position
    $('.woodmart-image-hotspot .hotspot-content').each(function () {
      var content = $(this);
      var offsetLeft = content.offset().left;
      var offsetRight = $(window).width() - (offsetLeft + content.outerWidth());

      if ($(window).width() > 768) {
        if (offsetLeft <= 0) content.addClass('hotspot-overflow-right');
        if (offsetRight <= 0) content.addClass('hotspot-overflow-left');
      }

      if ($(window).width() <= 768) {
        if (offsetLeft <= 0) content.css('marginLeft', Math.abs(offsetLeft - 15) + 'px');
        if (offsetRight <= 0) content.css('marginLeft', offsetRight - 15 + 'px');
      }
    });
  }
  return hotspotInit;
})(); 
theme.hotspot = {};
theme.imageHotspot = (function(){
  function imageHotspot(container) {
    var $container = this.$container = $(container);
    var sectionId = $container.attr('data-section-id');
    var hotspot = this.hotspot = '#image-hotspot-' + sectionId;
    theme.hotspot[hotspot] = new theme._imageHotspot(hotspot);
  }
  return imageHotspot;
})();
theme.imageHotspot.prototype = _.assignIn({}, theme.imageHotspot.prototype, {
  onUnload: function() {
    delete theme.hotspot[this.hotspot];
  }
});

function carouselSlider(el){
  var carousel = el,
      data_carousel = carousel.parent().find('.data-carousel');

  if(data_carousel.data('auto')) {
    var autoplay = true;
    var autoplayTime = data_carousel.data('auto');
  }else{
    var autoplay = false;
    var autoplayTime = 5000;
  }
  var item_320 = data_carousel.data('320')? data_carousel.data('320') : 1;
  var item_480 = data_carousel.data('480')? data_carousel.data('480') : 1; 
  var item_768 = data_carousel.data('768')? data_carousel.data('768') : 1;
  var item_992 = data_carousel.data('992')? data_carousel.data('992') : 1;
  var item_1200 = data_carousel.data('1200')? data_carousel.data('1200') : 1;
  carousel.owlCarousel({
    items: data_carousel.data('items'),
    smartSpeed: 500,
    autoplay: autoplay,
    loop: data_carousel.data('loop') ? carousel.children().length > data_carousel.data('items')?true:false : false,
    lazyLoad: true,
    autoplayTimeout:autoplayTime,
    autoplayHoverPause: true,
    dots: data_carousel.data('paging'),
    margin: data_carousel.data('margin'),
    nav: carousel.children().length > data_carousel.data('items')?data_carousel.data('nav'):false,
    navText: [data_carousel.data('prev'),data_carousel.data('next')],
    responsive: {
      0: {
        items:item_320
      },
      480: {
        items:item_480
      }, 
      768: {
        items:item_768
      },
      992: {
        items:item_992
      },
      1200: {
        items:item_1200
      }
    }
  });
}  
function productReview(){
  if ($(".spr-badge").length > 0) {
    SPR.registerCallbacks();
    SPR.initRatingHandler();
    SPR.initDomEls();
    SPR.loadProducts();
    SPR.loadBadges();
  }
}  
function countDownInit(){
  if($('.woodmart-timer').length>0){
    $( '.woodmart-timer' ).each(function(){
      var time = $(this).data('end-date');
      $( this ).countdown( time, function( event ) {
        $( this ).html( event.strftime(''
         + '<span class="countdown-days">%-D <span>' + window.date_text.day_text + '</span></span> '
         + '<span class="countdown-hours">%H <span>' + window.date_text.hour_text + '</span></span> '
         + '<span class="countdown-min">%M <span>' + window.date_text.min_text + '</span></span> '
         + '<span class="countdown-sec">%S <span>' + window.date_text.sec_text + '</span></span>'));
      });
    });
  } 
}
function isEmpty( el ){
  return !$.trim(el.html())
}
function checkItemCompareExist(){
  if($('#compareTableList table > tbody > tr:first-child > td').length > 1){
    return true;
  } else {
    return false;
  }
}
function setQuantityDown(event){
  var result = $(event.target).parents('.input-box').find('.quantity-selector');
  var qty = parseInt(result.val());
  if( qty > 1 )
    result.val(--qty);
  return false;
}
function setQuantityUp(event){
  var result = $(event.target).parents('.input-box').find('.quantity-selector');
  var qty = parseInt(result.val());
  result.val(++qty);
  return false;
}
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie (cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function removeWishlist (event){
  var currentHandle = $(event.target).data('productHandle');
  var handles = getCookie("wishlistItems");
  var productHandle = $('.link-wishlist').data('productHandle');
  var handlesAfterRemove = [];
  if (handles != "") {
    var wishlistArr = JSON.parse(handles); 
    $.each( wishlistArr, function( key, value ) {
      if(value != currentHandle){
        handlesAfterRemove.push(value);
      }
    });
    var json_str = JSON.stringify(handlesAfterRemove);
    setCookie("wishlistItems", json_str);
    var wishlistCount = handlesAfterRemove.length;
    if(wishlistCount > 0){
      $('#wishlistCount').html('(' + wishlistCount + ')');
      $('.woodmart-wishlist-info-widget .count').html(wishlistCount);
    } else {
      $('#wishlistCount').html('0');
      $('.woodmart-wishlist-info-widget .count').html('0');
    } 
    $(event.target).parents('tr').remove();
    var alertTemplate = '<div class="message alert alert-success">'+SW.page.translateText($(event.target).data("productTitle"))+' '+woodmart_settings.wishlist_data.remove+'</div>';
    $( "#wishlistAlert").html(alertTemplate);

    if(currentHandle == productHandle){
      $('.link-wishlist').removeClass('active');
    } 
    $(".category-products .link-wishlist").each(function() {
      var checkHandle = $(this).data("productHandle");
      if(checkHandle == currentHandle){
        $(this).removeClass('active');
      }
    });

    if (isEmpty($('#wishlistTableList tbody'))) {
      setCookie('wishlistItems', '');
      var alertTemplate = '<p class="alert alert-warning"><span class="brackets">'+woodmart_settings.wishlist_data.no_item+'</span></p>';
      $( "#wishlistAlert").append(alertTemplate); 
      $('#wishlistTableList .cart-table').hide();
    }
  }

}
function removeCompare (event){ 
  var currentHandle = $(event.target).parents('.product-image').find('.btn-delete-compare').data('productHandle');
  var handles = getCookie("compareItems");
  var productHandle = $('.link-compare').data('productHandle');
  var handlesAfterRemove = []; 
  if (handles != "") {
    var compareArr = JSON.parse(handles);

    $.each( compareArr, function( key, value ) {
      if(value != currentHandle){
        handlesAfterRemove.push(value);
      }
    });
    var json_str = JSON.stringify(handlesAfterRemove);
    setCookie("compareItems", json_str);
    var compareCount = handlesAfterRemove.length;
    if(compareCount > 0){
      $('#compareCount').html('(' + compareCount + ')');
      $('#header-compare .compareCount').html('('+compareCount+')');
    } else {
      $('#compareCount').html('');
      $('#header-compare .compareCount').html('');
    }

    var classRemove = $(event.target).parents('td').attr("class");
    $("#compareTableList").find('.'+classRemove).remove();
    var alertTemplate = '<div class="message alert alert-success">'+SW.page.translateText($(event.target).parents(".product-image").find(".btn-delete-compare").data("productTitle"))+' '+woodmart_settings.compare_data.remove+'</div>';
    $( "#compareAlert").html(alertTemplate);

    if(currentHandle == productHandle){
      $('.link-compare').removeClass('active');
    } 
    $(".category-products .link-compare").each(function() {
      var checkHandle = $(this).data("productHandle");
      if(checkHandle == currentHandle){
        $(this).removeClass('active');
      }
    });

    if (!checkItemCompareExist()) {
      $('#compareTableList').hide();
      setCookie('compareItems', '');
      var alertTemplate = '<p class="alert alert-warning"><span class="brackets">'+woodmart_settings.compare_data.no_item+'</span></p>';
      $( "#compareAlert").append(alertTemplate);
    }
  }

} 
$(document).ready(function() {
  var sections = new theme.Sections();
  sections.register('slideshow-section', theme.SlideshowSection); 
  sections.register('carousel-section', theme.carouselSlide);
  sections.register('feature-categories-section', theme.featureCategories); 
  sections.register('product-tab-section', theme.productTab);
  sections.register('product-grid-section', theme.productGrid);
  sections.register('video-poster-section', theme.videoPoster);
  sections.register('google-map-section', theme.googleMap);
  sections.register('instagram-section', theme.instagramSection);
  sections.register('gallery-section', theme.gallerySection);
  sections.register('promo-banner-section', theme.promoBanner);
  sections.register('image-hotspot-section', theme.imageHotspot);
});
var SW = SW || {};
(function ($) {
  var pixelRatio = !!window.devicePixelRatio ? window.devicePixelRatio : 1;
  var $window = $(window),
      body = $("body"),
      deviceAgent = navigator.userAgent.toLowerCase(),
      isMobileAlt = deviceAgent.match(/(iphone|ipod|ipad|android|iemobile)/),
      imageZoomThreshold = 20;
  var loading = false;
  var infinite_loaded_count = 1;  
  var woodmartTheme = {
    popupEffect: 'mfp-move-horizontal',
    supports_html5_storage: false,
    shopLoadMoreBtn: '.woodmart-products-load-more.load-on-scroll',
    bootstrapTooltips: '.woodmart-tooltip, .product-actions-btns > a, .wrapp-buttons .woodmart-buttons > div:not(.woodmart-add-btn) a, .wrapp-buttons .woodmart-buttons .woodmart-add-btn, body:not(.catalog-mode-on) .woodmart-hover-base:not(.product-in-carousel) .woodmart-buttons > div:not(.woodmart-add-btn) a, body:not(.catalog-mode-on) .woodmart-hover-base.hover-width-small:not(.product-in-carousel) .woodmart-add-btn, .woodmart-hover-base .product-compare-button a',
    ajaxLinks: '.woodmart-product-categories a, .widget_product_categories a, .widget_layered_nav_filters a, .filters-area a, .shopify-pagination a, .woodmart-shop-tools a, .layer-filter a'
  };
  SW.page = {
    init: function() { 
      if($('.woodmart-promo-popup').length > 0){ 
        SW.page.promoPopup();
      }   
      $(".checkout-info .shipping a").click(function() {
        if ($(this).hasClass('collapsed')) {
          $(this).parent().removeClass('closed');
        } else {
          $(this).parent().addClass('closed');
        }
      }); 
      SW.page.btnsToolTips();
      SW.page.simpleDropdown();
      SW.page.cartWidget();
      SW.page.mobileNavigation(); 
      SW.page.verticalHeader();
      SW.page.splitNavHeader();
      SW.page.fixedHeaders();
      SW.page.headerBanner();
      SW.page.menuSetUp();
      SW.page.blogMasonry();
      SW.page.blogLoadMore();
      SW.page.loginTabs();
      SW.page.carouselInit();
      SW.page.ajaxSearch();
      SW.page.searchFullScreen();
      SW.page.nanoScroller();
      SW.page.contentPopup();
      SW.page.scrollTop();
      SW.page.stickyColumn();
      SW.page.stickyFooter();
      $('body').addClass('document-ready');
    }, 
    fixedHeaders: function(){
      var getHeaderHeight = function(includeMargin) {
        var headerHeight = header.outerHeight(includeMargin);
        if( body.hasClass( 'sticky-navigation-only' ) ) {
          headerHeight = header.find( '.navigation-wrap' ).outerHeight(true);
        }
        return headerHeight;
      };
      var headerSpacer = function() {
        if(stickyHeader.hasClass(headerStickedClass)) return;
        $('.header-spacing').height(getHeaderHeight(true));
      };
      var body = $("body"),
          header = $(".main-header"),
          stickyHeader = header,
          headerHeight = getHeaderHeight(false),
          headerStickedClass = "act-scroll",
          stickyClasses = '',
          stickyStart = 0,
          links = header.find('.main-nav .menu>li>a');
      if( ! body.hasClass('enable-sticky-header') || body.hasClass('global-header-vertical') || header.length == 0 ) return;
      var logo = header.find(".site-logo").clone().html(),
          navigation = ( header.find(".main-nav").length ) ? header.find(".main-nav").clone().html() : '',
          rightColumn = ( header.find(".right-column").length ) ? header.find(".right-column").clone().html() : '',
          leftSide = header.find(".header-left-side").clone().html(),
          extraClass = header.data('sticky-class');
      if ( header.hasClass( 'header-advanced' ) ) {
        rightColumn = ( header.find(".secondary-header .right-column").length ) ? header.find(".secondary-header .right-column").clone().html() : '';
      }
      var headerClone = [
        '<div class="sticky-header header-clone ' + extraClass + '">',
        '<div class="container">',
        '<div class="wrapp-header">',
        '<div class="header-left-side">' + leftSide + '</div>',
        '<div class="site-logo">' + logo + '</div>',
        '<div class="main-nav site-navigation woodmart-navigation">' + navigation + '</div>',
        '<div class="right-column">' + rightColumn + '</div>',
        '</div>',
        '</div>',
        '</div>',
      ].join('');
        if( $( '.topbar-wrapp' ).length > 0 ) {
          stickyStart += $( '.topbar-wrapp' ).outerHeight();
        }
      if( $( '.header-banner' ).length > 0 ) {
        if ( body.hasClass( 'header-banner-display' ) ) {
          stickyStart += $( '.header-banner' ).outerHeight();
        }
      }
      if( body.hasClass( 'sticky-header-real' ) || header.hasClass('header-menu-top') ) {
        var headerSpace = $('<div/>').addClass('header-spacing');
        header.before(headerSpace);
        if( ! header.hasClass('header-menu-top') ) header.addClass('header-sticky-real'); 
      	headerSpacer();
        $(window).on('resize', headerSpacer);
        $(window).on("scroll", function(e){
          if ( body.hasClass( 'header-banner-hide' ) ) {
            stickyStart = ( $( '.topbar-wrapp' ).length > 0 )? $( '.topbar-wrapp' ).outerHeight() : 0;
          }
          if($(this).scrollTop() > stickyStart){
            stickyHeader.addClass(headerStickedClass);
          }else {
            stickyHeader.removeClass(headerStickedClass);
          }    
        });
      } else if( body.hasClass( 'sticky-header-clone' ) ) {
        header.before( headerClone );
        stickyHeader = $('.sticky-header');
      }
      // Change header height smooth on scroll
      if( body.hasClass( 'woodmart-header-smooth' ) ) {
        $(window).on("scroll", function(e){
          var space = ( 120 - $(this).scrollTop() ) / 2;
          if(space >= 60 ){
            space = 60;
          } else if( space <= 30 ) {
            space = 30;
          }
          links.css({
            paddingTop: space,
            paddingBottom: space
          });
        });
      }
      if(body.hasClass("woodmart-header-overlap") || body.hasClass( 'sticky-navigation-only' )){
      }
      if(!body.hasClass("woodmart-header-overlap") && body.hasClass("sticky-header-clone")){
        header.attr('class').split(' ').forEach(function(el) {
          if( el.indexOf('main-header') == -1 && el.indexOf('header-') == -1) {
            stickyClasses += ' ' + el;
          }
        });
        stickyHeader.addClass(stickyClasses);
        stickyStart += headerHeight;
        $(window).on("scroll", function(e){
          if ( body.hasClass( 'header-banner-hide' ) ) {
            stickyStart = $( '.topbar-wrapp' ).outerHeight() + headerHeight;
          }
          if($(this).scrollTop() > stickyStart){
            stickyHeader.addClass(headerStickedClass);
          }else {
            stickyHeader.removeClass(headerStickedClass);
          }
        });
      }
      SW.page.cartWidget();
      body.addClass('sticky-header-prepared');
    },
    headerBanner: function() {
      var banner_version = woodmart_settings.header_banner_version,
          banner_btn = woodmart_settings.header_banner_close_btn,
          banner_enabled = woodmart_settings.header_banner_enabled;
      if( $.cookie( 'woodmart_tb_banner_' + banner_version ) == 'closed' || banner_enabled == false ) return;
      var banner = $( '.header-banner' );
      $( 'body' ).addClass( 'header-banner-display' );
      banner.on( 'click', '.close-header-banner', function( e ) {
        e.preventDefault();
        closeBanner();
      })
      var closeBanner = function() {
        $( 'body' ).removeClass( 'header-banner-display' ).addClass( 'header-banner-hide' );
        $.cookie( 'woodmart_tb_banner_' + banner_version, 'closed', { expires: 60, path: '/' } );
      };
    },
    verticalHeader: function() {
      var $header = $('.header-vertical').first();
      if( $header.length < 1 ) return;
      var $body, $window, $sidebar, top = false,
          bottom = false, windowWidth, adminOffset, windowHeight, lastWindowPos = 0,
          topOffset = 0, bodyHeight, headerHeight, resizeTimer, Y = 0, delta,
          headerBottom, viewportBottom, scrollStep;
      $body          = $( document.body );
      $window        = $( window );
      adminOffset    = $body.is( '.admin-bar' ) ? $( '#wpadminbar' ).height() : 0;
      $window
      .on( 'scroll', scroll )
      .on( 'resize', function() {
        clearTimeout( resizeTimer );
        resizeTimer = setTimeout( resizeAndScroll, 500 );
      } );
      resizeAndScroll();
      for ( var i = 1; i < 6; i++ ) {
        setTimeout( resizeAndScroll, 100 * i );
      }
      // Sidebar scrolling.
      function resize() {
        windowWidth = $window.width();
        if ( 1024 > windowWidth ) {
          top = bottom = false;
          $header.removeAttr( 'style' );
        }
      }
      function scroll() {
        var windowPos = $window.scrollTop();
        if ( 1024 > windowWidth ) {
          return;
        }
        headerHeight   = $header.height();
        headerBottom   = headerHeight + $header.offset().top;
        windowHeight   = $window.height();
        bodyHeight     = $body.height();
        viewportBottom = windowHeight + $window.scrollTop();
        delta          = headerHeight - windowHeight;
        scrollStep     = lastWindowPos - windowPos;
        // If header height larger than window viewport
        if ( delta > 0 ) {
          // Scroll down
          if ( windowPos > lastWindowPos ) {
            // If bottom overflow
            if( headerBottom > viewportBottom ) {
              Y += scrollStep;
            }
            if( Y < -delta ) {
              bottom = true;
              Y = -delta;
            }
            top = false;
          } else if ( windowPos < lastWindowPos )  { // Scroll up
            // If top overflow
            if( $header.offset().top < $window.scrollTop() ) {
              Y += scrollStep;
            }
            if( Y >= 0 ) {
              top = true;
              Y = 0;
            }
            bottom = false;
          } else {
            if( headerBottom < viewportBottom ) {
              Y = windowHeight - headerHeight;
            }
            if( Y >= 0 ) {
              top = true;
              Y = 0;
            }
          }
        } else {
          Y = 0;
        }
        // Change header Y coordinate
        $header.css({
          top: Y
        });
        lastWindowPos = windowPos;
      }
      function resizeAndScroll() {
        resize();
        scroll();
      }
    },  
    splitNavHeader: function() {
      var header = $('.header-split');
      if( header.length <= 0 ) return;
      var navigation = header.find('.main-nav'),
          navItems = navigation.find('.menu > li'),
          itemsNumber = navItems.length,
          rtl = $('body').hasClass('rtl'),
          midIndex = parseInt( itemsNumber/2 + 0.5 * rtl - .5 ),
          midItem = navItems.eq( midIndex ),
          logo = header.find('.site-logo > .woodmart-logo-wrap'),
          logoWidth,
          leftWidth = 0,
          rule = ( ! rtl ) ? 'marginRight' : 'marginLeft',
          rightWidth = 0;
      var recalc = function() {
        logoWidth = logo.outerWidth(),
          leftWidth = 5,
          rightWidth = 0;
        for (var i = itemsNumber - 1; i >= 0; i--) {
          var itemWidth = navItems.eq(i).outerWidth();
          if( i > midIndex ) {
            rightWidth += itemWidth;
          } else {
            leftWidth += itemWidth;
          }
        };
        var diff = leftWidth - rightWidth;
        if( rtl ) {
          if( leftWidth > rightWidth ) {
            navigation.find('.menu > li:first-child').css('marginRight', -diff);
          } else {
            navigation.find('.menu > li:last-child').css('marginLeft', diff + 5);
          }
        } else {
          if( leftWidth > rightWidth ) {
            navigation.find('.menu > li:last-child').css('marginRight', diff + 5);
          } else {
            navigation.find('.menu > li:first-child').css('marginLeft', -diff);
          }
        }
        midItem.css(rule, logoWidth);
      };
      logo.imagesLoaded(function() {
        recalc();
        header.addClass('menu-calculated');
      });
      $(window).on('resize', recalc);
    },
    menuSetUp: function() {
      var hasChildClass = 'menu-item-has-children',
          mainMenu = $('.woodmart-navigation').find('ul.menu'),
          lis = mainMenu.find(' > li'),
          openedClass = 'item-menu-opened';
      $('.mobile-nav').find('ul.site-mobile-menu').find(' > li').has('.sub-menu-dropdown').addClass(hasChildClass);
      mainMenu.on('click', ' > .item-event-click > a', function(e) {
        e.preventDefault();
        if(  ! $(this).parent().hasClass(openedClass) ) {
          $('.' + openedClass).removeClass(openedClass);
        }
        $(this).parent().toggleClass(openedClass);
      });
      $(document).click(function(e) {
        var target = e.target;
        if ( $('.' + openedClass).length > 0 && ! $(target).is('.item-event-hover') && ! $(target).parents().is('.item-event-hover') && !$(target).parents().is('.' + openedClass + '')) {
          mainMenu.find('.' + openedClass + '').removeClass(openedClass);
          return false;
        }
      });
      var menuForIPad = function() {
        if( $(window).width() <= 1024 ) {
          mainMenu.find(' > .menu-item-has-children.item-event-hover').each(function() {
            $(this).data('original-event', 'hover').removeClass('item-event-hover').addClass('item-event-click');
          });
        } else {
          mainMenu.find(' > .item-event-click').each(function() {
            if( $(this).data('original-event') == 'hover' ) {
              $(this).removeClass('item-event-click').addClass('item-event-hover');
            }
          });
        }
      };
      $(window).on('resize', menuForIPad);
    }, 
    menuOffsets: function() {
      var mainMenu = $('.main-nav').find('ul.menu'),
          lis = mainMenu.find(' > li.menu-item-design-sized, li.menu-item-design-full-width');
      mainMenu.on('hover', ' > li.menu-item-design-sized, li.menu-item-design-full-width', function(e) {
        setOffset( $(this) );
      });
      var setOffset = function( li ) {
        var dropdown = li.find(' > .sub-menu-dropdown'),
            styleID = 'arrow-offset',
            $header = $('.main-header'),
            siteWrapper = $('.website-wrapper');
        dropdown.attr('style', '');
        var dropdownWidth = dropdown.outerWidth(),
            dropdownOffset = dropdown.offset(),
            screenWidth = $(window).width(),
            bodyRight = siteWrapper.outerWidth() + siteWrapper.offset().left,
            viewportWidth = ( $('body').hasClass('wrapper-boxed') ) ? bodyRight : screenWidth,
            extraSpace = ( li.hasClass( 'menu-item-design-full-width' ) ) ? 0 : 10;
        if( ! dropdownWidth || ! dropdownOffset ) return;
        var dropdownOffsetRight = screenWidth - dropdownOffset.left - dropdownWidth;
        if( $('body').hasClass('rtl') && dropdownOffsetRight + dropdownWidth >= viewportWidth && ( li.hasClass( 'menu-item-design-sized' ) || li.hasClass( 'menu-item-design-full-width' ) ) && ! $header.hasClass('header-vertical') ) {
          // If right point is not in the viewport
          var toLeft = dropdownOffsetRight + dropdownWidth - viewportWidth;
          dropdown.css({
            right: - toLeft - extraSpace
          }); 
        } else if( dropdownOffset.left + dropdownWidth >= viewportWidth && ( li.hasClass( 'menu-item-design-sized' ) || li.hasClass( 'menu-item-design-full-width' ) ) && ! $header.hasClass('header-vertical') ) {
          // If right point is not in the viewport
          var toRight = dropdownOffset.left + dropdownWidth - viewportWidth;
          dropdown.css({
            left: - toRight - extraSpace
          }); 
        }
      };
      lis.each(function() {
        setOffset( $(this) );
        $(this).addClass('with-offsets');
      });
    },
    mobileNavigation: function() {
      var body = $("body"),
          mobileNav = $(".mobile-nav"),
          wrapperSite = $(".website-wrapper"),
          dropDownCat = $(".mobile-nav .site-mobile-menu .menu-item-has-children"),
          elementIcon = '<span class="icon-sub-menu"></span>',
          butOpener = $(".icon-sub-menu");
      dropDownCat.append(elementIcon);
      mobileNav.on("click", ".icon-sub-menu", function(e) {
        e.preventDefault();
        if ($(this).parent().hasClass("opener-page")) {
          $(this).parent().removeClass("opener-page").find("> ul").slideUp(200);
          $(this).parent().removeClass("opener-page").find(".sub-menu-dropdown .container > ul, .sub-menu-dropdown > ul").slideUp(200);
          $(this).parent().find('> .icon-sub-menu').removeClass("up-icon");
        } else {
          $(this).parent().addClass("opener-page").find("> ul").slideDown(200);
          $(this).parent().addClass("opener-page").find(".sub-menu-dropdown .container > ul, .sub-menu-dropdown > ul").slideDown(200);
          $(this).parent().find('> .icon-sub-menu').addClass("up-icon");
        }
      });
      mobileNav.on('click', '.mobile-nav-tabs li', function() {
        if( $(this).hasClass('active') ) return;
        var menuName = $(this).data('menu');
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        $('.mobile-menu-tab').removeClass('active');
        $('.mobile-' + menuName + '-menu').addClass('active');
      });
      mobileNav.on('click', '.menu-item-register > a', function( e ) {
        if( $('.menu-item-register').find('.sub-menu-dropdown').length < 1 ) return;

        e.preventDefault();

        $('body').toggleClass('login-form-popup');
        closeMenu();
      });
      body.on("click", ".close-login-form", function() {

        $('body').removeClass('login-form-popup');
        openMenu();

      });
      body.on("click", ".mobile-nav-icon", function() {
        if (body.hasClass("act-mobile-menu")) {
          closeMenu();
        } else {
          openMenu();
        }
      });
      body.on("click touchstart", ".woodmart-close-side", function() {
        closeMenu();
      });
      function openMenu() {
        body.addClass("act-mobile-menu");
      }
      function closeMenu() {
        body.removeClass("act-mobile-menu");
        $( '.mobile-nav .searchform input[type=text]' ).blur();
      }
    },
    cartWidget: function() {
      var widget = $('.cart-widget-opener'),
          btn = widget.find('a'),
          body = $('body');
      widget.on('click', function(e) {
        e.preventDefault();
        if( isOpened() ) {
          closeWidget();
        } else {
          setTimeout( function() {
            openWidget();
          }, 10);
        }
      });
      body.on("click touchstart", ".woodmart-close-side", function() {
        if( isOpened() ) {
          closeWidget();
        }
      });
      body.on("click", ".widget-close", function( e ) {
        e.preventDefault();
        if( isOpened() ) {
          closeWidget();
        }
      });
      $( document ).keyup( function( e ) {
        if ( e.keyCode === 27 && isOpened() ) closeWidget();
      });
      var closeWidget = function() {
        $('body').removeClass('woodmart-cart-opened');
      };
      var openWidget = function() {
        if ( isCart() ) return false;
        $('body').addClass('woodmart-cart-opened');
      };
      var isOpened = function() {
        return $('body').hasClass('woodmart-cart-opened');
      };
      var isCart = function() {
        return $('body').hasClass('shopify-cart');
      }; 
    },
    simpleDropdown: function() { 
      $('.input-dropdown-inner').each(function() {
        var dd = $(this);
        var btn = dd.find('> a');
        var input = dd.find('> input');
        var list = dd.find('> .list-wrapper'); 
        inputPadding(); 
        $(document).click(function(e) {
          var target = e.target;
          if (dd.hasClass('dd-shown') && !$(target).is('.input-dropdown-inner') && !$(target).parents().is('.input-dropdown-inner')) {
            hideList();
            return false;
          }
        }); 
        btn.on('click', function(e) {
          e.preventDefault(); 
          if (dd.hasClass('dd-shown')) {
            hideList();
          } else {
            showList();
          }
          return false;
        }); 
        list.on('click', 'a', function(e) {
          e.preventDefault();
          var value = $(this).data('val');
          var label = $(this).html();
          list.find('.current-item').removeClass('current-item');
          $(this).parent().addClass('current-item');
          if (value != 0) {
            list.find('ul:not(.children) > li:first-child').show();
          } else if (value == 0) {
            list.find('ul:not(.children) > li:first-child').hide();
          } 
          btn.html(label);
          input.val(value);
          $(this).closest("form.has-categories-dropdown").attr("action", "/search/collections/" + value)
          hideList();
          inputPadding();
        });  
        function showList() {
          dd.addClass('dd-shown');
          list.slideDown(100);
          setTimeout(function() {
            SW.page.nanoScroller();
          }, 300); 
        } 
        function hideList() {
          dd.removeClass('dd-shown');
          list.slideUp(100);
        } 
        function inputPadding() {
          var paddingValue = dd.innerWidth() + dd.parent().siblings( '.searchsubmit' ).innerWidth() + 17,
              padding = 'padding-right';
          if( $( 'body' ).hasClass( 'rtl' ) ) padding = 'padding-left';
          dd.parent().parent().find( '.s' ).css( padding, paddingValue );
        }
      });
    },
    ajaxSearch: function() { 
      if(!woodmart_settings.search.ajax_search) return false;
      var form = $('form.searchform'); 
      var request = null;
      form.each(function() {
        var $this = $(this), 
            $results = $this.parent().find('.autocomplete-suggestions'),
            input = $this.find('input[name="q"]');
        $(this).find('input[name="q"]').attr("autocomplete", "off").bind("keyup change", function() {
          var key = $(this).val();
          if (key.trim() == '') {
            $results.hide();
          }else { 
            if(!woodmart_settings.search.search_by_collection) {
              var url = "/search?type=product&q=" + key; 
            }else{ 
              var val = input.val(), 
                  product_cat = $this.find('[name="product_cat"]').val(); 
              if(product_cat) {
                var url = "/search/collections/" + product_cat + "?type=product&q=" + val;
              }else{
                var url = "/search?type=product&q=" + val;
              }
            }
            form.addClass("search-loading"); 
            if (request != null) request.abort();
            request = $.get(url + "&view=json", function(e) {
              $results.html(e);
              if( $(window).width() >= 1024 ) {
                $(".woodmart-scroll").nanoScroller({
                  paneClass: 'woodmart-scroll-pane',
                  sliderClass: 'woodmart-scroll-slider',
                  contentClass: 'woodmart-scroll-content',
                  preventPageScrolling: true
                });                 
              }
              setTimeout(function() {
                form.removeClass("search-loading");
              }, 300)
            });
            $results.show(500);
          }
        })
        $( 'body' ).click( function(e) { 
          $results.hide(), form.removeClass("search-loading");
        });
        $( '.woodmart-search-results' ).click( function( e ) { 
          e.stopPropagation(); 
        });
      });
    }, 
    searchFullScreen: function() {
      var body = $('body'),
          searchWrapper = $('.woodmart-search-wrapper'),
          offset = 0;
      body.on('click', '.search-button > a', function(e) {
        e.preventDefault();
        if( $('.search-button').hasClass('woodmart-search-dropdown') || $(window).width() < 1024 ) return;
        if( $('.sticky-header.act-scroll').length > 0 ) {
          searchWrapper = $('.sticky-header .woodmart-search-wrapper');
        } else {
          searchWrapper = $('.main-header .woodmart-search-wrapper');
        }
        if( isOpened() ) {
          closeWidget();
        } else {
          setTimeout( function() {
            openWidget();
          }, 10);
        }
      });
      body.on("click", ".woodmart-close-search, .main-header, .sticky-header, .topbar-wrapp, .main-page-wrapper, .header-banner", function(event) {
        if ( ! $(event.target).is('.woodmart-close-search') && $(event.target).closest(".woodmart-search-wrapper").length ) return;
        if( isOpened() ) {
          closeWidget();
        }
      });
      var closeByEsc = function( e ) {
        if (e.keyCode === 27) {
          closeWidget();
          body.unbind('keyup', closeByEsc);
        }
      };
      var closeWidget = function() {
        $('body').removeClass('woodmart-search-opened');
        searchWrapper.removeClass('search-overlap');
      };
      var openWidget = function() {
        var bar = $('#wpadminbar').outerHeight();
        var offset = $('.main-header').outerHeight() + bar;
        if( ! $('.main-header').hasClass('act-scroll') ) {
          offset += $('.topbar-wrapp').outerHeight();
          if ( $('body').hasClass( 'header-banner-display' ) ) {
            offset += $('.header-banner').outerHeight();
          }
        }
        if( $('.sticky-header').hasClass('header-clone') && $('.sticky-header').hasClass('act-scroll') ) {
          offset = $('.sticky-header').outerHeight() + bar;
        }
        if( $('.main-header').hasClass('header-menu-top') && $('.header-spacing') ) {
          offset = $('.header-spacing').outerHeight() + bar;
        }
        searchWrapper.css('top', offset);
        // Close by esc
        body.bind('keyup', closeByEsc);
        $('body').addClass('woodmart-search-opened');
        searchWrapper.addClass('search-overlap');
        setTimeout(function() {
          searchWrapper.find('input[type="text"]').focus();
          $(window).one('scroll', function() {
            if( isOpened() ) {
              closeWidget();
            }
          });
        }, 300);
      };
      var isOpened = function() {
        return $('body').hasClass('woodmart-search-opened');
      };
    }, 
    carouselInit: function() {
      if($('.carousel-init.owl-carousel').length > 0) {
        var carousel = $('.carousel-init.owl-carousel');
        carousel.each(function(){
          carouselSlider($(this));
        });
      }
    },
    promoPopup: function() {
      if( !woodmart_settings.newsletter_enable != '0' || ( woodmart_settings.newsletter_hidden_mobile && $(window).width() < 768 ) ) return;
      var popup = $( '.woodmart-promo-popup' ),
          shown = false,
          pages = $.cookie('woodmart_shown_pages');

      if( ! pages ) pages = 0;

      if( pages < woodmart_settings.newsletter_on_page) {
        pages++;
        $.cookie('woodmart_shown_pages', pages, { expires: 7, path: '/' } );
        return false;
      }

      var showPopup = function() {
        $.magnificPopup.open({
          items: {
            src: '.woodmart-promo-popup'
          },
          type: 'inline',       
          removalDelay: 500, //delay removal by X to allow out-animation
          callbacks: {
            beforeOpen: function() {
              this.st.mainClass = woodmartTheme.popupEffect + ' promo-popup-wrapper';
            },
            open: function() {
              // Will fire when this exact popup is opened
              // this - is Magnific Popup object
            },
            close: function() {
              $.cookie('woodmart_popup', 'shown', { expires: 7, path: '/' } );
            }
            // e.t.c.
          }
        });
      };

      if ( $.cookie('woodmart_popup') != 'shown' ) {
        if( woodmart_settings.newsletter_show_after == 'scroll' ) {
          $(window).scroll(function() {
            if( shown ) return false;
            if( $(document).scrollTop() >= woodmart_settings.newsletter_scroll_delay ) {
              showPopup();
              shown = true;
            }
          });
        } else {
          setTimeout(function() {
            showPopup();
          }, woodmart_settings.newsletter_time_delay );
        }
      }

      $('.woodmart-open-newsletter').on('click',function(e){
        e.preventDefault();
        showPopup();
      })
    },
    translateBlock: function(blockSelector) {
      if (multi_language && translator.isLang2()) {
        translator.doTranslate(blockSelector);
      }
    },
    translateText: function(str) {
      if (!multi_language || str.indexOf("|") < 0)
        return str;

      if (multi_language) {
        var textArr = str.split("|");
        if (translator.isLang2())
          return textArr[1];
        return textArr[0];
      }
    }, 
    nanoScroller: function() { 
      if( $(window).width() < 1024 ) return; 
      $(".woodmart-scroll").nanoScroller({
        paneClass: 'woodmart-scroll-pane',
        sliderClass: 'woodmart-scroll-slider',
        contentClass: 'woodmart-scroll-content',
        preventPageScrolling: false
      }); 
      $( 'body' ).bind( 'wc_fragments_refreshed wc_fragments_loaded added_to_cart', function() {
        $(".widget_shopping_cart .woodmart-scroll").nanoScroller({
          paneClass: 'woodmart-scroll-pane',
          sliderClass: 'woodmart-scroll-slider',
          contentClass: 'woodmart-scroll-content',
          preventPageScrolling: false
        });
      });
    },
    backHistory: function() {
      history.go(-1); 
      setTimeout(function(){
        $('.filters-area').removeClass('filters-opened').stop().hide();
        $('.open-filters').removeClass('btn-opened');
        if( $(window).width() < 992 ) {
          $('.woodmart-product-categories').removeClass('categories-opened').stop().hide();
          $('.woodmart-show-categories').removeClass('button-open');
        }  
      }, 20); 
    },
    btnsToolTips: function() { 
      if ( $(window).width() < 1024 ) return; 
      var $tooltips = $('.woodmart-css-tooltip, .product-grid-item:not(.woodmart-hover-base):not(.woodmart-hover-icons) .woodmart-buttons > div a, .woodmart-hover-base.product-in-carousel .woodmart-buttons > div a'),
          $bootstrapTooltips = $(woodmartTheme.bootstrapTooltips);
      // .product-grid-item .add_to_cart_button
      $tooltips.each(function() {
        $(this).find('.woodmart-tooltip-label').remove();
        $(this).addClass('woodmart-tltp').prepend('<span class="woodmart-tooltip-label">' + $(this).text() +'</span>');
      })
      .off('mouseover.tooltips')
      .on('mouseover.tooltips', function() {
        var $label = $(this).find('.woodmart-tooltip-label'),
            width = $label.outerWidth();
        if ( $('body').hasClass('rtl') ) {
          $label.css({
            marginRight: - parseInt( width/2 )
          })
        }else{
          $label.css({
            marginLeft: - parseInt( width/2 )
          })
        }
      });
      // Bootstrap tooltips
      $bootstrapTooltips.tooltip({
        animation: false,
        container: 'body',
        trigger : 'hover',
        title: function() {
          if( $(this).find('.added_to_cart').length > 0 ) return $(this).find('.add_to_cart_button').text();
          return $(this).text();
        }
      });
    },
    blogMasonry: function() {
      if (typeof($.fn.isotope) == 'undefined' || typeof($.fn.imagesLoaded) == 'undefined') return;
      var $container = $('.masonry-container');
      // initialize Masonry after all images have loaded
      $container.imagesLoaded(function() {
        $container.isotope({
          gutter: 0,
          isOriginLeft: ! $('body').hasClass('rtl'),
          itemSelector: '.blog-design-masonry, .blog-design-mask, .masonry-item'
        });
      });
      $('.masonry-filter').on('click', 'a', function(e) {
        e.preventDefault();
        $('.masonry-filter').find('.filter-active').removeClass('filter-active');
        $(this).addClass('filter-active');
        var filterValue = $(this).attr('data-filter');
        $container.isotope({
          filter: filterValue
        });
      });

    },
    blogLoadMore: function() {
      var btnClass = '.woodmart-blog-load-more.load-on-scroll',
          process = false;
      SW.collection.clickOnScrollButton( btnClass , false, false );
      $('.woodmart-blog-load-more').on('click', function(e) {
        e.preventDefault();
        if( process ) return;
        process = true;
        var $this = $(this),
            holder = $this.parent().siblings('.woodmart-blog-holder'),
            ajaxurl = $(this).attr('href'),
            dataType = 'html',
            method = 'GET';
        $this.addClass('loading');
        $.ajax({
          url: ajaxurl,
          dataType: dataType,
          method: method,
          success: function(data) {
            var items = $(data).find('.woodmart-blog-holder').html(),
                status = $(data).find('.blog-footer').data('status'),
                moreurl = $(data).find('.blog-footer .woodmart-blog-load-more').attr("href"); 
            if( items ) {
              if( holder.hasClass('masonry-container') ) {
                // initialize Masonry after all images have loaded 
                holder.append(items).isotope( 'appended', items );
                holder.imagesLoaded().progress(function() {
                  holder.isotope('layout');
                  SW.collection.clickOnScrollButton( btnClass , true, false );
                });
              } else {
                holder.append(items);
                SW.collection.clickOnScrollButton( btnClass , true, false );
              }
              status == 'have-posts' ? $this.attr("href", moreurl) : $this.remove();
            }
            if( status == 'no-more-posts' ) {
              $this.remove();
            }
          },
          error: function(data) {
            console.log('ajax error');
          },
          complete: function() {
            $this.removeClass('loading');
            process = false;
          },
        });

      });
    },
    loginTabs: function() {
      var tabs = $('.woodmart-register-tabs'),
          btn = tabs.find('.woodmart-switch-to-register'),
          title = $('.col-register-text h2'),
          login = tabs.find('.col-login'),
          loginText = tabs.find('.login-info'),
          register = tabs.find('.col-register'),
          classOpened = 'active-register',
          loginLabel = woodmart_settings.login_btn_text,
          registerLabel = woodmart_settings.register_btn_text;

      btn.click(function(e) {
        e.preventDefault();

        if( isShown() ) {
          hideRegister();
        } else {
          showRegister();
        }

        var scrollTo = $('.main-page-wrapper').offset().top - 100;

        if( $(window).width() < 768 ) {
          $('html, body').stop().animate({
            scrollTop: tabs.offset().top - 90
          }, 400);
        }
      });

      var showRegister = function() {
        tabs.addClass(classOpened);
        btn.text(loginLabel);
        if ( loginText.length > 0 ) {
          title.text(registerLabel);
        }
      };

      var hideRegister = function() {
        tabs.removeClass(classOpened);
        btn.text(registerLabel);
        if ( loginText.length > 0 ) {
          title.text(loginLabel);
        }
      };

      var isShown = function() {
        return tabs.hasClass(classOpened);
      };
    },
    contentPopup: function() {
      var popup = $( '.woodmart-open-popup' );
      popup.magnificPopup({
        type: 'inline',      
        removalDelay: 500, //delay removal by X to allow out-animation
        callbacks: {
          beforeOpen: function() {
            this.st.mainClass = woodmartTheme.popupEffect + ' content-popup-wrapper';
          },
        }
      });
    },
    scrollTop: function() {
      //Check to see if the window is top if not then display button
      $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
          $('.scrollToTop').addClass('button-show');
        } else {
          $('.scrollToTop').removeClass('button-show');
        }
      });

      //Click event to scroll to top
      $('.scrollToTop').click(function() {
        $('html, body').animate({
          scrollTop: 0
        }, 800);
        return false;
      });
    },
    stickyColumn: function() {
        var details = $('.woodmart-sticky-column');

        details.each(function() {
          var $column = $(this),
              offset = 0;

          if( $('body').hasClass('enable-sticky-header') || $('.whb-sticky-row').length > 0 || $('.whb-sticky-header').length > 0 ) {
            offset = 150;
          }

          $column.find(' > .vc_column-inner > .wpb_wrapper').stick_in_parent({
            offset_top: offset
          });
        })

      },
        stickyFooter: function() {
          if( ! $('body').hasClass( 'sticky-footer-on' ) || $( window ).width() <= 1024 ) return;
          var $footer = $( '.footer-container' ),
              $page = $( '.main-page-wrapper' ),
              $window = $( window );

          if( $( '.woodmart-prefooter' ).length > 0 ) {
            $page = $( '.woodmart-prefooter' );
          }
          var footerOffset = function() {
            $page.css( {
              marginBottom: $footer.outerHeight()
            } )
          };
          $window.on( 'resize', footerOffset );
          $footer.imagesLoaded( function() {
            footerOffset();
          } );
        }
  };
  SW.collection = {
    init: function() {
      var wishlistCount = 0;
      var compareCount = 0;
      var compareItemhandles = getCookie("compareItems");
      if (compareItemhandles != "") {
        var compareArr = JSON.parse(compareItemhandles);
        compareCount = compareArr.length;
        if(compareCount > 0)
          $('#header-compare .compareCount').html('('+compareCount+')');
      }
      /*Get number of wishlist*/
      var handles = getCookie("wishlistItems");
      if (handles != "") {
        var wishlistArr = JSON.parse(handles);
        wishlistCount = wishlistArr.length;
        if(wishlistCount > 0)
          $('.woodmart-wishlist-info-widget .count').html(wishlistCount);
      }
      SW.collection.checkWishlist();
      SW.collection.checkCompare(); 
      if($('.product-deal .product-date').length > 0){
        var productsDeal = $('.product-date');
        productsDeal.each(function(){
          SW.collection.productDealInit($(this));
        });
      }  
      $(document).on("click", ".close-box", function(){
        $(this).parents('.box-popup').removeClass('show');
      })  
      $( document ).on('click', '.widget_shopping_cart .remove', function(e) {
        e.preventDefault();
        SW.collection.removeCartInit($(this).data('product_id'));
        $(this).parent().addClass('removing-process');
      });

      $(document).on("click", ".filter-bar a", function(e) {
        e.preventDefault();
        if ($('.filter-option-group').is('.open')) {
          $('.filter-option-group').removeClass('open');
        }
        else{
          $('.filter-option-group').addClass('open');
        }
      });
      /*wishlist & compare*/
      $(document).on('click', '.add_to_wishlist',function (e) {
        e.preventDefault(); 
        var a = $(this);
        a.addClass('loading');
        var productHandle = $(this).data('productHandle');
        Shopify.getProduct(productHandle, function(product) {
          var checkItemExist = false;
          var wishlistArr = [];
          var handles = getCookie("wishlistItems");
          if (handles != "") {
            var wishlistArr = JSON.parse(handles);
            wishlistCount = wishlistArr.length;
            $.each( wishlistArr, function( key, value ) {
              if(value == product.handle){
                checkItemExist = true;
                return false;
              }
            });
          } else {
            var wishlistArr = [product.handle];
            var json_str = JSON.stringify(wishlistArr);
            setCookie("wishlistItems", json_str);
            wishlistCount = 1;
          }

          if(checkItemExist){
            if (isEmpty($('#wishlistTableList tbody'))) {
              SW.collection.genarate(wishlistArr);
              $('#wishlistCount').html('(' + wishlistCount + ')');
            }
            var alertTemplate = [
              '<div class="message alert alert-warning">'+SW.page.translateText(product.title)+' '+woodmart_settings.wishlist_data.item_exist+'</div>',
            ].join('');
            $( "#wishlistAlert").html(alertTemplate);
          } else {
            if (handles != "") {
              wishlistArr.push(product.handle);
              var json_str = JSON.stringify(wishlistArr);
              setCookie("wishlistItems", json_str);
              wishlistCount = wishlistArr.length;
              if (isEmpty($('#wishlistTableList tbody'))) {
                SW.collection.genarate(wishlistArr);
              } else {
                SW.collection.genarate([product.handle]);
              }
            } else {
              SW.collection.genarate(wishlistArr);
            }
            $('.woodmart-wishlist-info-widget .count').html(wishlistCount);
            $('#wishlistCount').html('(' + wishlistCount + ')');
            var alertTemplate = [
              '<div class="message alert alert-success">'+SW.page.translateText(product.title)+' '+woodmart_settings.wishlist_data.item_added+'</div>',
            ].join('');
            $( "#wishlistAlert").html(alertTemplate);
            SW.collection.checkWishlist();
          }
          setTimeout(function(){
            a.removeClass('loading');
            $("#wishlistModal").modal("show");
          }, 700);
        });
      });
      $('#wishlistModal').on('hidden.bs.modal', function () {
        $('#opacity').removeClass('active');
      });
      $(document).on('click','.woodmart-wishlist-info-widget', function(){ 
        $("#resultLoading").show();
        if (isEmpty($('#wishlistTableList tbody'))) {
          var handles = getCookie("wishlistItems");
          if (handles != "") {
            var wishlistArr = JSON.parse(handles);
            SW.collection.genarate(wishlistArr);
            $('#wishlistCount').html('(' + wishlistCount + ')');
            setTimeout(function(){
              $("#resultLoading").hide();
              $("#wishlistModal").modal("show");
            }, 700);
          } else {
            $("#resultLoading").hide();
            $("#wishlistModal").modal("show");
            var alertTemplate = [
              '<p class="alert alert-warning"><span class="brackets">'+woodmart_settings.wishlist_data.no_item+'</span></p>',
            ].join('');
            $( "#wishlistAlert").html(alertTemplate);
          }
        } else {
          $('#wishlistTableList .cart-table').show();
          $("#resultLoading").hide();
          $("#wishlistModal").modal("show");
        }
      });
      $("#wishlistModal").on('change', 'select', function(){
        var productHandle = $(this).parents('form').data('handle');
        var $thisForm = $(this).parents('form');
        var optionArr = [];
        $thisForm.find('.selector-wrapper select').each(function(){
          var optionSelected = $(this).data('position');
          var valueSelected = this.value;
          optionArr.push(valueSelected);
        });
        Shopify.getProduct(productHandle, function(product){
          $.each(product.variants, function( key, value ) {
            var checkGetId = false;
            $.each(optionArr, function( index, optionValue ) {
              if(optionArr[index] == value.options[index]){
                checkGetId = true;
              } else {
                checkGetId = false;
                return false;
              }
            });
            if(checkGetId){
              $thisForm.find("input[name='id']").val(value.id);
              return false;
            }
          });
        });

      });
      $("#compareBox").on('change', 'select', function(){
        var productHandle = $(this).parents('form').data('handle');
        var $thisForm = $(this).parents('form');
        var optionArr = [];
        $thisForm.find('.selector-wrapper select').each(function(){
          var optionSelected = $(this).data('position');
          var valueSelected = this.value;
          optionArr.push(valueSelected);
        });

        Shopify.getProduct(productHandle, function(product){

          $.each(product.variants, function( key, value ) {
            var checkGetId = false;
            $.each(optionArr, function( index, optionValue ) {
              if(optionArr[index] == value.options[index]){
                checkGetId = true;
              } else {
                checkGetId = false;
                return false;
              }
            });
            if(checkGetId){
              $thisForm.find("input[name='id']").val(value.id);
              return false;
            }
          });
        });

      });
      $(document).on('click', '.product-compare-button a', function () {
        $('#opacity').addClass('active');
        var a = $(this);
        a.addClass('loading');
        var productHandle = $(this).data('productHandle');
        Shopify.getProduct(productHandle, function(product) {
          var checkItemExist = false;
          var compareArr = [];
          var handles = getCookie("compareItems");
          if (handles != "") {
            var compareArr = JSON.parse(handles);
            compareCount = compareArr.length;
            $.each( compareArr, function( key, value ) {
              if(value == product.handle){
                checkItemExist = true;
                return false;
              }
            });
          } else {
            var compareArr = [product.handle];
            var json_str = JSON.stringify(compareArr);
            setCookie("compareItems", json_str);
            compareCount = 1;
          }

          if(checkItemExist){
            if (!checkItemCompareExist()) {
              SW.collection.genarateCompareTable(compareArr);
              $('#compareCount').html('(' + compareCount + ')');
            }
            var alertTemplate = [
              '<div class="message alert alert-warning">'+SW.page.translateText(product.title)+' '+woodmart_settings.compare_data.item_exist+'</div>',
            ].join('');
            $("#compareAlert").html(alertTemplate);
          } else {
            if (handles != "") {
              compareArr.push(product.handle);
              var json_str = JSON.stringify(compareArr);
              setCookie("compareItems", json_str);
              compareCount = compareArr.length;
              if (!checkItemCompareExist()) {
                SW.collection.genarateCompareTable(compareArr);
              } else {
                SW.collection.genarateCompareTable([product.handle]);
              }
            } else {
              SW.collection.genarateCompareTable(compareArr);
            }
            $('#header-compare .compareCount').html('('+compareCount+')');
            $('#compareCount').html('(' + compareCount + ')');
            var alertTemplate = [
              '<div class="message alert alert-success">'+SW.page.translateText(product.title)+' '+woodmart_settings.compare_data.item_added+'</div>',
            ].join('');
            $( "#compareAlert").html(alertTemplate);
            $("#compareTableList").show();
            SW.collection.checkCompare();
          }
          setTimeout(function(){
            a.removeClass('loading');
            $("#compareBox").modal("show");
          }, 700);
        });
      });
      $('#compareBox').on('hidden.bs.modal', function () {
        $('#opacity').removeClass('active');
      });
      $(document).on('click','#header-compare', function(){ 
        $("#resultLoading").show();
        if (!checkItemCompareExist()) {
          var handles = getCookie("compareItems");
          if (handles != "") {
            var compareArr = JSON.parse(handles);
            SW.collection.genarateCompareTable(compareArr);
            $('#compareCount').html('(' + compareCount + ')');
            setTimeout(function(){
              $("#resultLoading").hide();
              $("#compareBox").modal("show");
            }, 700);
          } else {
            var alertTemplate = '<p class="alert alert-warning"><span class="brackets">'+woodmart_settings.compare_data.no_item+'</span></p>';
            $( "#compareAlert").html(alertTemplate);
            $("#compareTableList").hide();
            $("#resultLoading").hide();
            $("#compareBox").modal("show");
          }
        } else {
          $("#resultLoading").hide();
          $("#compareBox").modal("show");
        }
      });
      $('#wishlistModal').on('click', '.add-cart-wishlist', function(){
        var quantity =  $(this).parents('tr').find('.quantity-selector').val();
        $(this).parents('tr').find('form').find("input[name='quantity']").val(quantity);
        $(this).parents('tr').find('.single_add_to_cart_button').click();
        $(this).parents('td').find('.remove-wishlist-form').click();
        $("#wishlistModal").modal("hide");
      });
      $('#compareBox').on('click', '.add-cart-compare', function(){
        var className = $(this).parent('td').attr('class');
        var quantity =  $(this).parents('td').find('.quantity-selector').val();
        $(this).parents('tr').prev().find('.'+className).find('form').find("input[name='quantity']").val(quantity);
        $(this).parents('tr').prev().find('.'+className).find('.single_add_to_cart_button').click();
        $(this).parents('tbody').find('.'+className).find('.btn-delete-compare').click();
        $("#compareBox").modal("hide");
      });
      /* moving action links into product image area */
      $(".move-action .item .details-area .actions").each(function(){
        $(this).parents('.item-area').children(".product-image-area").append($(this));
      });
      $("[data-with-product]").each(function(){
        SW.collection.prevNextProductData($(this));
      });
      SW.collection.ajaxAddToCart(); 
      SW.collection.formAjaxAddToCart(); 
      SW.collection.sidebarMenuInit(); 
      countDownInit();   
      SW.collection.productHover();
      SW.collection.swatchesOnGrid();
      SW.collection.quickShop();
      SW.collection.shopLoader();
      SW.collection.categoriesMenu();
      SW.collection.categoriesMenuBtns();
      SW.collection.filtersArea();
      SW.collection.ajaxFilters();
      SW.collection.productsLoadMore();
      SW.collection.shopMasonry();
  	  SW.collection.cartPopup();
      SW.collection.shopHiddenSidebar();  
    },
    createCookie:function(name, value, days) {
      var expires;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
    },
    readCookie:function(name) {
      var nameEQ = escape(name) + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
      }
      return null;
    },
    eraseCookie: function(name) {
      SW.collection.createCookie(name, "", -1);
    },
    animateItems: function(productsInstance) {
      productsInstance.find(".product").each(function(aj) {
        $(this).css('opacity', 1);
        $(this).addClass("item-animated");
        $(this).delay(aj * 200).animate({
          opacity: 1
        }, 500, "easeOutExpo", function() {
          $(this).addClass("item-animated")
        });
      });
    }, 
    productDealInit: function(productDeal){
      var date = productDeal.data('date');
      if(date){
        var config = {date: date};
        $.extend(config, countdown);
        $.extend(config, countdownConfig);
        if(countdownTemplate){
          config.template = countdownTemplate;
        }
        productDeal.countdown(config);
      }
    }, 
    ajaxAddToCart: function(){
      if(woodmart_settings.ajax_cart_enable == false ) return;
      $(document).on("click", ".ajax_add_to_cart", function(e) {
        e.preventDefault();
        var a = $(this),
            p = a.data("pid");
        a.addClass("loading"); 
        return $.ajax({
          type: "POST",
          url: "/cart/add.js", 
          data: {
            quantity: 1,
            id: p
          },
          dataType: "json", 
          error: function(t) { 
            data = $.parseJSON(t.responseText);
            alert(data.message + "(" + data.status + "): " + data.description);
          },
          success: function(t) {
            if( woodmart_settings.cart_data.shoping_cart_action == 'widget' )
              $.magnificPopup.close();

            $.get("/cart?view=json", function(e) {
              $(".widget_shopping_cart_content").html(e);
            }),$.getJSON("/cart.js", function(e) {
              $(".woodmart-cart-number").html(e.item_count + ' <span>'+woodmart_settings.cart_data.totalNumb+'</span>');
              $(".woodmart-cart-subtotal >span").html(Shopify.formatMoney(e.total_price, money_format));
            });

            woodmart_settings.enableCurrency && currenciesCallbackSpecial(".woodmart-cart-totals span.money");
            a.removeClass('loading');
            // Trigger event so themes can refresh other areas
            $( document.body ).trigger( 'added_to_cart');

            return false;
          },
          cache: !1
        });
      });
    },
    formAjaxAddToCart: function(){
      if(woodmart_settings.ajax_cart_enable == false ) return;
      $(document).on("click", ".single_add_to_cart_button", function(e) {
        e.preventDefault();
        var a = $(this);
        var form = a.closest("form"); 
        a.attr('disabled', 'disabled').css('pointer-events', 'none').addClass('loading');
        return $.ajax({
          type: "POST",
          url: "/cart/add.js",
          async: !0,
          data: form.serialize(),
          dataType: "json",
          error: function(t) {
            data = $.parseJSON(t.responseText);
            alert(data.message + "(" + data.status + "): " + data.description);
          },
          success: function(t) {
            $.get("/cart?view=json", function(e) {
              $(".widget_shopping_cart_content").html(e);
            }),$.getJSON("/cart.js", function(e) {
              $(".woodmart-cart-number").html(e.item_count + ' <span>'+woodmart_settings.cart_data.totalNumb+'</span>');
              $(".woodmart-cart-subtotal >span").html(Shopify.formatMoney(e.total_price, money_format));
            });
            a.removeAttr('disabled').css("pointer-events", "auto").removeClass('loading');
            woodmart_settings.enableCurrency && currenciesCallbackSpecial(".woodmart-cart-totals span.money");
            // Trigger event so themes can refresh other areas
            $( document.body ).trigger( 'added_to_cart');
            return false;
          },
          cache: !1
        });
      });
    }, 
    cartPopup: function() {
      var timeoutNumber = 0;
      $('body').bind('added_to_cart', function(event) {
      if(woodmart_settings.cart_data.shoping_cart_action == 'popup') {
        var html = [
          '<div class="added-to-cart">',
          '<h4>' + woodmart_settings.cart_data.addedCart + '</h4>',
          '<a href="#" class="btn btn-style-link btn-color-default close-popup">' + woodmart_settings.cart_data.continueShop + '</a>',
          '<a href="/cart" class="btn btn-color-primary view-cart">' + woodmart_settings.cart_data.buttonViewCart + '</a>',
          '</div>',
        ].join("");
          $.magnificPopup.open({
          removalDelay: 500,
          callbacks: {
            beforeOpen: function() {
              this.st.mainClass = woodmartTheme.popupEffect + '  cart-popup-wrapper';
            }
          },
          items: {
            src: '<div class="mfp-with-anim white-popup popup-added_to_cart">' + html + '</div>',
            type: 'inline'
          }
        });
        $('.white-popup').on('click', '.close-popup', function(e) {
          e.preventDefault(); 
          $.magnificPopup.close(); 
        });
      }
      if(woodmart_settings.cart_data.shoping_cart_action == 'widget') {
        clearTimeout(timeoutNumber);
        if( $('.cart-widget-opener').length > 0 ) {
          $('.cart-widget-opener').trigger('click');
          $.magnificPopup.close();
        } else if( $('.act-scroll .woodmart-shopping-cart').length > 0 ) {
          $('.act-scroll .woodmart-shopping-cart').addClass('display-widget');
          $.magnificPopup.close();
          timeoutNumber = setTimeout(function() {
            $('.display-widget').removeClass('display-widget');
          }, 3500 );
        } else {
          $('.main-header .woodmart-shopping-cart').addClass('display-widget');
          $.magnificPopup.close();
          timeoutNumber = setTimeout(function() {
            $('.display-widget').removeClass('display-widget');
          }, 3500 );
        }
      }
      SW.page.btnsToolTips();
      });
    },
    removeCartInit: function(id){ 
      if(woodmart_settings.ajax_cart_enable == false ) return;
      $.ajax({
        type: 'POST',
        url: '/cart/change.js',
        data:  'quantity=0&id='+id,
        dataType: 'json',
        success: function(t) {
          $.get("/cart?view=json", function(e) {
            $(".widget_shopping_cart_content").html(e);
          }),$.getJSON("/cart.js", function(e) {
            $(".woodmart-cart-number").html(e.item_count + ' <span>'+woodmart_settings.cart_data.totalNumb+'</span>');
            $(".woodmart-cart-subtotal >span").html(Shopify.formatMoney(e.total_price, money_format));
          });
        },
        error: function(XMLHttpRequest,textStatus) {
          Shopify.onError(XMLHttpRequest, textStatus);
        }
      });
    },
    sidebarMenuInit: function(){
      $("#mobile-menu, #categories_nav").mobileMenu({
        accordion: true,
        speed: 400,
        closedSign: 'collapse',
        openedSign: 'expand',
        mouseType: 0,
        easing: 'easeInOutQuad'
      });
    },
    ajaxFilters: function() { 
      if( ! $('body').hasClass('woodmart-ajax-shop-on') ) return; 
      var products = $('.products'); 
      $('body').on('click', '.products-footer .shopify-pagination a', function(e) {
        scrollToTop();
      }); 
      $(document).pjax(woodmartTheme.ajaxLinks, '.main-page-wrapper', {
        timeout: 5000, 
        fragment: ".main-page-wrapper",
        scrollTo: false
      });  
      $(document).on("change", "select.orderby", function(e) { 
        var $form = $(".shopify-ordering form");
        $.pjax({
          container: ".main-page-wrapper",
          timeout: 4000,
          url: $form.attr("action"),
          data: $form.serialize(),
          fragment: ".main-page-wrapper",
          scrollTo: false
        })   
      });  
      $(document).on('pjax:error', function(xhr, textStatus, error, options) {
        console.log('pjax error ' + error);
      }); 
      $(document).on('pjax:start', function(xhr, options) {
        $('body').addClass('woodmart-loading'); 
      }); 
      $(document).on('pjax:complete', function(xhr, textStatus, options) { 
        SW.collection.productHover(); 
        SW.collection.quickShop();   
        SW.page.translateBlock('.main-page-wrapper');
        productReview();
        countDownInit();
        woodmart_settings.enableCurrency && currenciesCallbackSpecial(".site-content .products span.money");
        SW.collection.checkWishlist();
        SW.collection.checkCompare();
        SW.page.btnsToolTips();
        SW.collection.clickOnScrollButton( woodmartTheme.shopLoadMoreBtn , false, 300 ); 
        SW.collection.shopMasonry();
        setTimeout(function() {
          SW.page.nanoScroller();
        }, 200);
        $('body').removeClass('woodmart-loading'); 
        scrollToTop();
      }); 
      $(document).on('pjax:end', function(xhr, textStatus, options) { 
        $('body').removeClass('woodmart-loading'); 
      }); 
      var scrollToTop = function() {
        var $scrollTo = $('.main-page-wrapper'),
            scrollTo = $scrollTo.offset().top - 100; 
        $('html, body').stop().animate({
          scrollTop: scrollTo
        }, 400);
      };
    }, 
    checkWishlist: function(){
      var productHandle = $('.product-options-bottom .link-wishlist').data('productHandle');
      var handles = getCookie("wishlistItems");
      if (handles != "") {
        var wishlistArr = JSON.parse(handles);
        $.each( wishlistArr, function( key, value ) {
          if(value == productHandle){
            $('.product-options-bottom .link-wishlist').addClass('active');
            return false;
          }
        });  
        $(".category-products .link-wishlist").each(function() {
          var currentHandle = $(this).data("productHandle");
          if($.inArray(currentHandle, wishlistArr) > -1){
            $(this).addClass('active');
          }
        });
      }
    },
    checkCompare: function(){
      var productHandle = $('.product-options-bottom .link-compare').data('productHandle');
      var handles = getCookie("compareItems");
      if (handles != "") {
        var compareArr = JSON.parse(handles);
        $.each(compareArr, function (key, value) {
          if (value == productHandle) {
            $('.product-options-bottom .link-compare').addClass('active');
            return false;
          }
        }); 
        $(".category-products .link-compare").each(function() {
          var currentHandle = $(this).data("productHandle");
          if($.inArray(currentHandle, compareArr) > -1){
            $(this).addClass('active');
          }
        });
      }
    },
    genarate: function(wishlistArr){
      var count = wishlistArr.length;
      $.each( wishlistArr, function( key, productHandle ) {
        Shopify.getProduct(productHandle, function(product) {
          var htmlOptionTemplate = '<form action="/cart/add" method="post" enctype="multipart/form-data" data-handle="'+product.handle+'">';
          var checkHideOption = false;
          if (typeof product.options !== 'undefined') {
            var countOptions = product.options.length;
            $.each( product.options, function( index, option ) {
              var optionClass = '';
              if(countOptions == 1 && option.name == 'Title'){
                checkHideOption = true;
              } 
              if(option.name == 'Title'){
                optionClass = 'hide';
              }
              htmlOptionTemplate += '<div class="'+optionClass+' wishlistOption'+index+'">';
              htmlOptionTemplate += '<div class="selector-wrapper js product-form__item">';
              htmlOptionTemplate += '<label>'+option.name+'</label>';
              htmlOptionTemplate += '<select id="WishlistSingleOptionSelector-'+option.position+'" class="single-option-selector single-option-selector-wishlist product-form__input">';
              $.each( option.values, function( key, value ) {
                htmlOptionTemplate += '<option value="'+value+'">'+ value +'</option>';
              });
              htmlOptionTemplate += '</select></div></div>'; 
            }); 
            $('#wishlistModalBody .product-options').show();
          }

          htmlOptionTemplate += '<input type="hidden" name="id" value="'+product.variants[0].id+'"> <input type="hidden" name="quantity" value="1"><button type="button" class="single_add_to_cart_button button hide">Add cart</button></form>';
          $('#wishlistModalBody .product-options-form').html(htmlOptionTemplate);
          if(product.compare_at_price > 0){ 
            $('#wishlistModalBody .compare_at_price').html(Shopify.formatMoney(product.compare_at_price, money_format));
          }
          var htmlTemplate = $('#wishlistModalBody tbody').html();
          var html = ''; 
          var img = product.featured_image.lastIndexOf("."); 
          html += htmlTemplate.replace(/#image#/g, product.featured_image.slice(0, img) + "_100x" + product.featured_image.slice(img))
          .replace(/#title#/g, SW.page.translateText(product.title))
          .replace(/#urlProduct#/g, product.url)
          .replace(/#handle#/g, product.handle)
          .replace(/#price#/g, Shopify.formatMoney(product.price, money_format)); 
          $("#wishlistTableList tbody").append(html);  
          $('#wishlistTableList .cart-table').show();
          if(product.compare_at_price > 0){
            $('#wishlistTableList .compare-price').show(); 
          }
        });
      });
    },
    genarateCompareTable: function(compareArr){
      var count = compareArr.length;
      var countCurrentItem = $('#compareTableList table > tbody > tr:first-child > td').length;
      $.each( compareArr, function( key, productHandle ) {
        Shopify.getProduct(productHandle, function(product) {
          if (typeof product.options !== 'undefined') {
            var optionTemplate = ' <td class="compare-item-'+countCurrentItem+'"> <form action="/cart/add" method="post" enctype="multipart/form-data" data-handle="'+product.handle+'">';
            $.each( product.options, function( index, option ) {
              var optionClass = '';
              if(option.name == 'Title'){
                optionClass = 'hide';
              } 
              optionTemplate += '<div class="selector-wrapper js product-form__item '+optionClass+'">';
              optionTemplate += '<label>'+option.name+'</label>';
              optionTemplate += '<select id="conpareSingleOptionSelector-'+option.position+'" data-position = "option'+option.position+'" class="single-option-selector single-option-selector-wishlist product-form__input">';
              $.each( option.values, function( key, value ) {
                optionTemplate += '<option value="'+value+'">'+ value +'</option>';
              });
              optionTemplate += '</select></div>';
            });
            optionTemplate += '<input type="hidden" name="id" value="'+product.variants[0].id+'"><input type="hidden" name="quantity" value="1">';
			optionTemplate += '<button type="button" class="single_add_to_cart_button button hide">Add cart hidden</button></form></td>';
          } 
          var img = product.featured_image.lastIndexOf(".");  
          var featuresTemplate = '<td class="compare-item-'+countCurrentItem+'">';
            featuresTemplate += '<div class="product-image">';
            featuresTemplate += '<img src="'+product.featured_image.slice(0, img) + "_100x" + product.featured_image.slice(img)+'"><a class="btn-delete-compare" data-product-title="'+SW.page.translateText(product.title)+'" data-product-handle="'+product.handle+'" href="javascript:void(0);" onclick="removeCompare(event)"><i aria-hidden="true" class="fa fa-trash"></i></a>';
          	featuresTemplate += '</div>';
          	featuresTemplate += '<span class="product-title">'+SW.page.translateText(product.title)+'</span>';
            featuresTemplate += '</td>';
          if(product.available){
            var availabilityTemplate = '<td class="compare-item-'+countCurrentItem+'">';
            availabilityTemplate += '<div class="product-shop-stock-avai"><p class="availability in-stock"><span><span class="brackets">'+woodmart_settings.product_data.in_stock+'</span></span></p></div>';
            availabilityTemplate += '</td>';
          } else {
            var availabilityTemplate = '<td class="compare-item-'+countCurrentItem+'">';
            availabilityTemplate += '<div class="product-shop-stock-avai"><p class="availability in-stock"><span><span class="brackets">'+woodmart_settings.product_data.out_of_stock+'</span></span></p></div>';
            availabilityTemplate += '</td>';
          }
          var addClassHide = '';
          if(product.compare_at_price <= 0 || !product.compare_at_price){
            addClassHide = 'hide';
          }
          var priceTemplate = '<td class="compare-item-'+countCurrentItem+'">';
              priceTemplate += '<div class="product-shop-stock-price">';
              priceTemplate += '<span class="price">';
              priceTemplate += '<del class="'+ addClassHide +'"><span class="shopify-Price-amount amount">'+Shopify.formatMoney(product.compare_at_price, money_format)+'</span></del>';
              priceTemplate += '<ins><span class="shopify-Price-amount amount">'+Shopify.formatMoney(product.price, money_format)+'</span></ins>';
              priceTemplate += '</span>'; 
              priceTemplate += '</div>';
              priceTemplate += '</td>'; 
          var actionTemplate = '<td class="compare-item-'+countCurrentItem+'">';
              actionTemplate += '<div class="product-type-main product-view">';
              actionTemplate += '<div class="product-options-bottom">';
              actionTemplate += '<div class="add-to-cart-box">';
              actionTemplate += '<div class="input-box pull-left">';
              actionTemplate += '<div class="quantity">';
              actionTemplate += '<input type="button" value="-" class="minus increase" onclick="setQuantityDown(event)">';
              actionTemplate += '<input type="number" name="quantity" value="1" min="1" class="quantity-selector" size="4">';
              actionTemplate += '<input type="button" value="+" class="plus reduced" onclick="setQuantityUp(event)">';
              actionTemplate += '</div>';
              actionTemplate += '</div>';
              actionTemplate += '</div>';
              actionTemplate += '</div>';
              actionTemplate += '</div>';
          if(product.available){
            actionTemplate += '<a href="javascript:void(0);" class="add-cart-compare btn-button">'+woodmart_settings.product_data.add_to_cart+'</a></td>';
          }else {
            actionTemplate += '<span class="btn-button">'+woodmart_settings.product_data.sold_out+'</span></td>';
          } 
          $("#compareTableList table tbody tr:first-child").append(featuresTemplate);
          $("#compareTableList table tbody tr:nth-child(2)").append(availabilityTemplate);
          $("#compareTableList table tbody tr:nth-child(3)").append(priceTemplate);
          $("#compareTableList table tbody tr:nth-child(4)").append(optionTemplate);
          $("#compareTableList table tbody tr:nth-child(5)").append(actionTemplate);
          ++countCurrentItem;
        });
      });
    },
    productHover : function(){ 
      $('.woodmart-hover-base').each(function(){ 
        var $product = $(this); 
        $product.imagesLoaded(function() { 
          // Read more details button 
          var btnHTML = '<a href="#" class="more-details-btn"><span>' + 'more' + '</a></span>',
              content = $product.find('.hover-content'),
              inner = content.find('.hover-content-inner'),
              contentHeight = content.outerHeight(),
              innerHeight = inner.outerHeight(),
              delta = innerHeight - contentHeight;

          if( content.hasClass( 'more-description' ) ) return; 
          if( delta > 30 ) {
            content.addClass('more-description');
            content.append(btnHTML);
          } else if( delta > 0 ) {
            content.css( 'height', contentHeight + delta );
          } 
          // Bottom block height 
          reculc( $product );
        }); 
      }); 
      $('body').on('click', '.more-details-btn', function(e) {
        e.preventDefault();
        $(this).parent().addClass('show-full-description');
        reculc( $(this).parents('.woodmart-hover-base') );
      }); 
      if( $(window).width() < 992 ) {
        $('.woodmart-hover-base').on('click', function( e ) {
          var hoverClass = 'state-hover';
          if( ! $(this).hasClass(hoverClass) ) {
            e.preventDefault();
            $('.' + hoverClass ).removeClass(hoverClass);
            $(this).addClass(hoverClass);
          }
        });
      } 
      var reculc = function( $el ) {  
        if( $el.hasClass('product-in-carousel') ) {
          return;
        } 
        var heightHideInfo = $el.find('.fade-in-block').outerHeight(); 
        $el.find('.content-product-imagin').css({
          marginBottom : -heightHideInfo
        }); 
        $el.addClass('hover-ready'); 
      }; 
      $('.product-grid-item').each(function() {
        var $el = $(this),
            widthHiddenInfo = $el.outerWidth(); 
        if($(window).width() <= 1024 && $el.hasClass('woodmart-hover-icons')) return; 
        if( widthHiddenInfo < 255 || $(window).width() <= 1024 ) {
          $el.removeClass('hover-width-big').addClass('hover-width-small'); 
        } else {
          $el.removeClass('hover-width-small').addClass('hover-width-big'); 
        }
      }) 
    },
    swatchesOnGrid: function() { 
      $(document).on('click', '.swatch-on-grid', function() { 
        var src, srcset, image_sizes; 
        var imageSrc = $(this).data('image-src'),
            imageSrcset = $(this).data('image-srcset'),
            imageSizes = $(this).data('image-sizes'); 
        if( typeof imageSrc == 'undefined' ) return; 
        var product = $(this).parents('.product-grid-item'),
            image = product.find('img').first(),
            srcOrig = image.data('original-src'),
            srcsetOrig = image.data('original-srcset'),
            sizesOrig = image.data('original-sizes'); 
        if( typeof srcOrig == 'undefined' ) {
          image.data('original-src', image.attr('src'));
        } 
        if( typeof srcsetOrig == 'undefined' ) {
          image.data('original-srcset', image.attr('srcset'));
        } 
        if( typeof sizesOrig == 'undefined' ) {
          image.data('original-sizes', image.attr('sizes'));
        }  
        if( $(this).hasClass('current-swatch') ) {
          src = srcOrig;
          srcset = srcsetOrig;
          image_sizes = sizesOrig;
          $(this).removeClass('current-swatch');
          product.removeClass('product-swatched');
        } else {
          $(this).parent().find('.current-swatch').removeClass('current-swatch');
          $(this).addClass('current-swatch');
          product.addClass('product-swatched');
          src = imageSrc;
          srcset = imageSrcset;
          image_sizes = imageSizes;
        } 
        if( image.attr('src') == src ) return; 
        product.addClass('loading-image'); 
        image.attr('src', src).attr('srcset', srcset).attr('image_sizes', image_sizes).one('load', function() {
          product.removeClass('loading-image');
        }); 
      }); 
    },
    quickShop: function() { 
      var btnSelector = '.quick-shop-on.product-type-variable .add_to_cart_button'; 
      $(document).on('click', btnSelector, function( e ) {
        e.preventDefault(); 
        var $this = $(this),
            $product = $this.parents('.product').first(),
            $content = $product.find('.quick-shop-form'),
            $url = $this.attr("href"),
            loadingClass = 'btn-loading'; 
        if( $this.hasClass(loadingClass) ) return; 
        // Simply show quick shop form if it is already loaded with AJAX previously
        if( $product.hasClass('quick-shop-loaded') ) {
          $product.addClass('quick-shop-shown');
          return;
        } 
        $this.addClass(loadingClass);
        $product.addClass('loading-quick-shop'); 
        $.ajax({
          url: $url, 
          method: 'get',
          success: function(data) { 
            // insert variations form
            $content.append(data);  
            $('body').trigger('woodmart-quick-view-displayed'); 
            SW.page.btnsToolTips(); 
          },
          complete: function() {
            $this.removeClass(loadingClass);
            $product.removeClass('loading-quick-shop');
            $product.addClass('quick-shop-shown quick-shop-loaded');
          },
          error: function() {
          },
        }); 
      }) 
      .on('click', '.quick-shop-close', function() {
        var $this = $(this),
            $product = $this.parents('.product'),
            $form = $product.find(".quick-shop-form");; 
        $product.removeClass('quick-shop-shown quick-shop-loaded');
        $form.html("");
      });  
    }, 
    shopLoader: function() {
      var loaderClass = '.woodmart-shop-loader',
          contentClass = '.products',
          sidebarClass = '.area-sidebar-shop',
          sidebarLeftClass = 'sidebar-left',
          hiddenClass = 'hidden-loader',
          hiddenTopClass = 'hidden-from-top',
          hiddenBottomClass = 'hidden-from-bottom';

      var loaderVerticalPosition = function() {
        var $products = $(contentClass),
            $loader = $products.parent().find(loaderClass);

        if ( $products.length < 1 ) return;

        var offset = $(window).height() / 2,
            scrollTop = $(window).scrollTop(),
            holderTop = $products.offset().top - offset,
            holderHeight = $products.height(),
            holderBottom = holderTop + holderHeight - 130;

        if (scrollTop < holderTop) {
          $loader.addClass(hiddenClass + ' ' + hiddenTopClass);
        } else if( scrollTop > holderBottom ) {
          $loader.addClass(hiddenClass + ' ' + hiddenBottomClass);
        } else {
          $loader.removeClass(hiddenClass + ' ' + hiddenTopClass + ' ' + hiddenBottomClass);
        }
      };

      var loaderHorizontalPosition = function () {
        var $products = $(contentClass),
            $sidebar = $(sidebarClass),
            $loader = $products.parent().find(loaderClass),
            sidebarWidth = $sidebar.outerWidth();

        if ( $products.length < 1 ) return;

        if( sidebarWidth > 0 && $sidebar.hasClass(sidebarLeftClass) ) {
          if ( $('body').hasClass('rtl') ) {
            $loader.css({
              'marginLeft': - sidebarWidth / 2 - 15
            })
          }else{
            $loader.css({
              'marginLeft': sidebarWidth / 2 - 15
            })
          }
        } else if( sidebarWidth > 0 ) {
          if ( $('body').hasClass('rtl') ) {
            $loader.css({
              'marginLeft': sidebarWidth / 2 - 15
            })
          }else{
            $loader.css({
              'marginLeft': - sidebarWidth / 2 - 15
            })
          }
        }

      }; 
      $(window).off('scroll.loaderVerticalPosition');
      $(window).off('loaderHorizontalPosition'); 
      $(window).on('scroll.loaderVerticalPosition', loaderVerticalPosition);
      $(window).on('resize.loaderHorizontalPosition', loaderHorizontalPosition); 
      loaderVerticalPosition();
      loaderHorizontalPosition();
    },
    categoriesMenu: function() {
      if( $(window).width() > 1024 ) return; 
      var categories = $('.woodmart-product-categories'),
          subCategories = categories.find('li > ul'),
          button = $('.woodmart-show-categories'),
          time = 200; 
      //this.categoriesMenuBtns(); 
      $('body').on('click','.icon-drop-category', function(){
        if($(this).closest('.has-sub').find('> ul').hasClass('child-open')){
          $(this).removeClass("woodmart-act-icon").closest('.has-sub').find('> ul').slideUp(time).removeClass('child-open');
        }else {
          $(this).addClass("woodmart-act-icon").closest('.has-sub').find('> ul').slideDown(time).addClass('child-open');
        }
      });  
      $('body').on('click', '.woodmart-show-categories', function(e) {
        e.preventDefault();

        if( isOpened() ) {
          closeCats();
        } else {
          //setTimeout(function() {
          openCats();
          //}, 50);
        }
      }); 
      $('body').on('click', '.woodmart-product-categories a', function(e) {
        closeCats();
        categories.stop().attr('style', '');
      }); 
      var isOpened = function() {
        return $('.woodmart-product-categories').hasClass('categories-opened');
      }; 
      var openCats = function() {
        $('.woodmart-product-categories').addClass('categories-opened').stop().slideDown(time);
        $('.woodmart-show-categories').addClass('button-open'); 
      }; 
      var closeCats = function() {
        $('.woodmart-product-categories').removeClass('categories-opened').stop().slideUp(time);
        $('.woodmart-show-categories').removeClass('button-open');
      };
    }, 
    categoriesMenuBtns: function() {
      if( $(window).width() > 991 ) return; 
      var categories = $('.woodmart-product-categories'),
          subCategories = categories.find('li > ul'),
          iconDropdown = '<span class="icon-drop-category"></span>'; 
      categories.addClass('responsive-cateogires');
      subCategories.parent().addClass('has-sub').find('> .category-nav-link').prepend(iconDropdown);
    },
    filtersArea: function() {
      var filters = $('.filters-area'),
          btn = $('.open-filters'),
          time = 200; 
      $('body').on('click', '.open-filters', function(e) {
        e.preventDefault(); 
        if( isOpened() ) {
          closeFilters();
        } else {
          openFilters();
        } 
      });  
      $('body').on('click', woodmartTheme.ajaxLinks, function() {
        if( isOpened() ) {
          closeFilters();
        }
      });
      var isOpened = function() {
        filters = $('.filters-area')
        return filters.hasClass('filters-opened');
      }; 
      var closeFilters = function() {
        filters = $('.filters-area')
        filters.removeClass('filters-opened');
        filters.stop().slideUp(time);
        $('.open-filters').removeClass('btn-opened');
      }; 
      var openFilters = function() {
        filters = $('.filters-area')
        filters.stop().slideDown(time);
        $('.open-filters').addClass('btn-opened');
        setTimeout(function() {
          filters.addClass('filters-opened');
          SW.page.nanoScroller();
        }, time);
      };
    },
    productsLoadMore: function() {

        var process = false,
            intervalID;

        $('.woodmart-products-element').each(function() {
          var $this = $(this),
              cache = [],
              inner = $this.find('.woodmart-products-holder');

          if( ! inner.hasClass('pagination-arrows') ) return;

          cache[1] = inner.html();

          $this.on('recalc', function() {
            calc();
          });

          $(window).resize(function() {
            calc();
          });

          var calc = function() {
            var height = inner.outerHeight();
            if( inner.hasClass('pagination-more-tn') || inner.hasClass('pagination-view-all') ) {
              $this.stop().css({height: height + 46});
            }else {
              $this.stop().css({height: height});
            }
            
          };
          inner.imagesLoaded(function() {
            inner.trigger('recalc');
          });
          // sticky buttons
			
          var body = $('body'),
              btnWrap = $this.find('.products-footer'),
              btnLeft = btnWrap.find('.woodmart-products-load-prev'),
              btnRight = btnWrap.find('.woodmart-products-load-next'),
              loadWrapp = $this.find('.woodmart-products-loader'),
              scrollTop,
              holderTop,
              btnLeftOffset,
              btnRightOffset,
              holderBottom,
              holderHeight,
              holderWidth,
              btnsHeight,
              offsetArrow = 50,
              offset,
              windowWidth;

          if( body.hasClass('rtl') ) {
            btnLeft = btnRight;
            btnRight = btnWrap.find('.woodmart-products-load-prev');
          }

          $(window).scroll(function() {
            buttonsPos();
          });

          function buttonsPos() {

            offset = $(window).height() / 2;

            windowWidth = $(window).outerWidth(true);

            holderWidth = $this.outerWidth(true);

            scrollTop = $(window).scrollTop();

            holderTop = $this.offset().top - offset;

            btnLeftOffset = $this.offset().left - offsetArrow;

            btnRightOffset = btnLeftOffset + holderWidth + offsetArrow;

            btnsHeight = btnLeft.outerHeight();

            holderHeight = $this.height() - btnsHeight;

            holderBottom = holderTop + holderHeight;

            btnLeft.css({
              'left' : btnLeftOffset + 'px'
            });

            btnRight.css({
              'left' : btnRightOffset + 'px'
            });

            // Right arrow position for vertical header
            // if( $('.main-header').hasClass('header-vertical') && ! body.hasClass('rtl') ) {
            //     btnRightOffset -= $('.main-header').outerWidth();
            // } else if( $('.main-header').hasClass('header-vertical') && body.hasClass('rtl') ) {
            //     btnRightOffset += $('.main-header').outerWidth();
            // }

            btnRight.css({
              'left' : btnRightOffset + 'px'
            });

            if (scrollTop < holderTop || scrollTop > holderBottom) {
              btnWrap.removeClass('show-arrow');
              loadWrapp.addClass('hidden-loader');
            } else {
              btnWrap.addClass('show-arrow');
              loadWrapp.removeClass('hidden-loader');
            }

          };

          $this.find('.woodmart-products-load-prev, .woodmart-products-load-next').off('click').on('click', function(e) {

            e.preventDefault();

            if( process || $(this).hasClass('disabled') ) return; process = true;

            clearInterval(intervalID);

            var $this = $(this),
                holder = $this.parent().parent().prev(),
                next = $this.parent().find('.woodmart-products-load-next'),
                prev = $this.parent().find('.woodmart-products-load-prev'),
                ajaxurl = $(this).find('a').attr("href"), 
                paged = holder.attr('data-paged');

            paged++;
            if( $this.hasClass('woodmart-products-load-prev') ) {
              if( paged < 2 ) return;
              paged = paged - 2;
            }

            loadProducts( 'arrows', ajaxurl, paged, holder, $this, cache, function(data) {
              holder.addClass('woodmart-animated-products');
              var items = $(data).find('.woodmart-products-holder').html(),
                  status = $(data).find('.products-footer').data('status'),
                  _next = $(data).find('.woodmart-products-load-next');
              if( data ) {
                holder.html(items).attr('data-paged', paged);
                holder.imagesLoaded().progress(function() {
                  holder.parent().trigger('recalc');
                });

                SW.collection.productHover(); 
                SW.collection.quickShop();   
                SW.page.translateBlock('.main-page-wrapper');
                productReview();
                countDownInit();
                woodmart_settings.enableCurrency && currenciesCallbackSpecial(".site-content .products span.money");
                SW.collection.checkWishlist();
                SW.collection.checkCompare();
                SW.page.btnsToolTips();
                SW.collection.shopMasonry();
              }

              if( $(window).width() < 768 ) {
                $('html, body').stop().animate({
                  scrollTop: holder.offset().top - 150
                }, 400);
              }

              var iter = 0;
              intervalID = setInterval(function() {
                holder.find('.product-grid-item').eq(iter).addClass('woodmart-animated');
                iter++;
              }, 100);

              if( paged > 1 ) {
                prev.removeClass('disabled');
              } else {
                prev.addClass('disabled');
              }

              if( status == 'no-more-posts' ) {
                next.html('Load next products');
                next.addClass('disabled');
              } else {
                next.html(_next.html());
                next.removeClass('disabled');
              }
            });

          });
        });

        SW.collection.clickOnScrollButton( woodmartTheme.shopLoadMoreBtn , false, 300 );

        $(document).off('click', '.woodmart-products-load-more').on('click', '.woodmart-products-load-more',  function(e) {
          e.preventDefault();

          if( process ) return; process = true;

          var $this = $(this),
              holder = $this.parent().siblings('.woodmart-products-holder'), 
              ajaxurl = $this.attr("href"), 
              paged = holder.data('paged');

          paged++; 

          loadProducts( 'load-more', ajaxurl, paged, holder, $this, [], function(data) {
            if( data ) {
              var items = $(data).find('.woodmart-products-holder').html(),
                  status = $(data).find('.products-footer').data('status'),
                  moreurl = $(data).find('.products-footer .woodmart-products-load-more').attr("href"),
                  paged = $(data).find('.woodmart-products-holder').data('paged'); 
              status == 'have-posts' ? $this.attr("href", moreurl) : $this.remove();
              if( holder.hasClass('grid-masonry') ) {
                isotopeAppend(holder, items);
              } else {
                holder.append(items);
              }

              holder.imagesLoaded().progress(function() {
                SW.collection.clickOnScrollButton( woodmartTheme.shopLoadMoreBtn , true, 300 );
              });

              holder.data('paged', paged);

              SW.collection.productHover();
              SW.page.btnsToolTips();
            }
          });

        });

        var loadProducts = function( btnType, ajaxurl, paged, holder, btn, cache, callback) {
          if( cache[paged] ) {
            holder.addClass('loading');
            setTimeout(function() {
              if(paged == 1) { 
                callback(cache[paged]);
                var items = $(cache[paged]);
                holder.html(items).attr('data-paged', '1');
                holder.imagesLoaded().progress(function() {
                  holder.parent().trigger('recalc');
                });
                SW.collection.productHover(); 
                SW.collection.quickShop();   
                SW.page.translateBlock('.main-page-wrapper');
                productReview();
                countDownInit();
                woodmart_settings.enableCurrency && currenciesCallbackSpecial(".site-content .products span.money");
                SW.collection.checkWishlist();
                SW.collection.checkCompare();
                SW.page.btnsToolTips();
                SW.collection.shopMasonry();
                setTimeout(function() {
                  SW.page.nanoScroller();
                }, 200); 
                var iter = 0;
                intervalID = setInterval(function() {
                  holder.find('.product-grid-item').eq(iter).addClass('woodmart-animated');
                  iter++;
                }, 100); 
              }else {
                callback(cache[paged]);
              } 
              holder.removeClass('loading');
              process = false;
            }, 300);
            return;
          }

          if (btnType == 'arrows') holder.addClass('loading').parent().addClass('element-loading');

          btn.addClass('loading');

          $.ajax({
            url: ajaxurl,
            dataType: "html",
            type: "GET",
            success: function(data) {
              cache[paged] = data;
              callback( data );
            },
            error: function(data) {
              console.log('ajax error');
            },
            complete: function() {
              if (btnType == 'arrows') holder.removeClass('loading').parent().removeClass('element-loading');
              btn.removeClass('loading');
              process = false; 
              SW.collection.productHover();
              //woodmartThemeModule.countDownTimer();
            },
          });
        };

        var isotopeAppend = function(el, items) {
          // initialize Masonry after all images have loaded
          var items = $(items);
          el.append(items).isotope( 'appended', items );
          el.imagesLoaded().progress(function() {
            el.isotope('layout');
          });
        };

      }, 
    clickOnScrollButton: function( btnClass, destroy, offset ) {
      if( typeof $.waypoints != 'function' ) return;

      var $btn = $(btnClass );
      if( destroy ) {
        $btn.waypoint('destroy');
      }

      if( ! offset ) {
        offset = 0;
      } 
      $btn.waypoint(function(){
        $btn.trigger('click');
      }, { offset: function() {
        return $(window).outerHeight() + parseInt(offset);                    
      } });
    },
    shopMasonry: function() {
      if (typeof($.fn.isotope) == 'undefined' || typeof($.fn.imagesLoaded) == 'undefined') return;
      var $container = $('.elements-grid.grid-masonry');
      // initialize Masonry after all images have loaded
      $container.imagesLoaded(function() {
        $container.isotope({
          isOriginLeft: ! $('body').hasClass('rtl'),
          itemSelector: '.product-grid-item',
        });
      }); 
    },
    shopHiddenSidebar: function() {
      $('body').on('click', '.woodmart-show-sidebar-btn', function() {
        if( $('.sidebar-container').hasClass('show-hidden-sidebar') ) {
          SW.collection.hideShopSidebar();
        } else {
          showSidebar();
        }
      });
      $('body').on("click touchstart", ".woodmart-close-side, .woodmart-close-sidebar-btn", function() {
        SW.collection.hideShopSidebar();
      });
      var showSidebar = function() {
        $('.sidebar-container').addClass('show-hidden-sidebar');
        $('body').addClass('woodmart-show-hidden-sidebar');
        $('.woodmart-show-sidebar-btn').addClass('btn-clicked');

        if( $(window).width() >= 1024 ) {
          $(".sidebar-inner.woodmart-sidebar-scroll").nanoScroller({
            paneClass: 'woodmart-scroll-pane',
            sliderClass: 'woodmart-scroll-slider',
            contentClass: 'woodmart-sidebar-content',
            preventPageScrolling: false
          }); 
        }
      };
    },
    hideShopSidebar: function() {
      $('.woodmart-show-sidebar-btn').removeClass('btn-clicked');
      $('.sidebar-container').removeClass('show-hidden-sidebar');
      $('body').removeClass('woodmart-show-hidden-sidebar');
      $(".sidebar-inner.woodmart-scroll").nanoScroller({ destroy: true });
    } 
  };
  SW.product = {
    init: function(){
      $('.product-360-button a').magnificPopup({
        type: 'inline',
        mainClass: 'mfp-fade', 
        preloader: false,
        fixedContentPos: false,
        callbacks: {
          open: function() {
            $(window).resize()
          },
        },
      }); 
      $('.product-video-button a').magnificPopup({
        type: 'iframe', 
        preloader: false,
        fixedContentPos: false
      });  
      SW.product.productAccordion();
      SW.product.quickViewInit();
    },
    productAccordion: function() {
      var $accordion = $('.wc-tabs-wrapper');

      var time = 300;

      var hash  = window.location.hash;
      var url   = window.location.href;

      if ( hash.toLowerCase().indexOf( 'comment-' ) >= 0 || hash === '#reviews' || hash === '#tab-reviews' ) {
        $accordion.find('.tab-title-reviews').addClass('active');
      } else if ( url.indexOf( 'comment-page-' ) > 0 || url.indexOf( 'cpage=' ) > 0 ) {
        $accordion.find('.tab-title-reviews').addClass('active');
      } else {
        $accordion.find('.woodmart-accordion-title').first().addClass('active');
      }

      $accordion.on('click', '.woodmart-accordion-title', function( e ) {
        e.preventDefault();

        var $this = $(this),
            $panel = $this.siblings('.shopify-Tabs-panel');

        var curentIndex = $this.parent().index();
        var oldIndex = $this.parent().siblings().find('.active').parent('.woodmart-tab-wrapper').index();

        if( $this.hasClass('active') ) {
          oldIndex = curentIndex;
          $this.removeClass('active');
          $panel.stop().slideUp(time);
        } else {
          $accordion.find('.woodmart-accordion-title').removeClass('active');
          $accordion.find('.shopify-Tabs-panel').slideUp();
          $this.addClass('active');
          $panel.stop().slideDown(time);
        }

        if ( oldIndex == -1 ) oldIndex = curentIndex;

        $(window).resize();

        setTimeout( function() {
          $(window).resize();
          if ( $( window ).width() < 1024 && curentIndex > oldIndex ) {
            $('html, body').animate({
              scrollTop: $this.offset().top - $this.outerHeight() - $('.sticky-header').outerHeight() - 50
            }, 500);
          }   
        }, time);

      } );
    },
    stickyDetails: function() {
      if( 
        ! $('body').hasClass('woodmart-product-sticky-on') 
        || $( window ).width() < 992
      ) return;

      var details = $('.entry-summary');

      details.each(function() {
        var $column = $(this),
            offset = 40,
            $inner = $column.find('.summary-inner'),
            $images = $column.parent().find('.product-images-inner'); 
        if( $('body').hasClass('enable-sticky-header') ) {
          offset = 150;
        } 
        $images.imagesLoaded(function() {
          var diff = $inner.outerHeight() - $images.outerHeight();  
          if( diff < -100 ) {
            $inner.stick_in_parent({
              offset_top: offset
            });
          } else if( diff > 100 ) { 
            $images.stick_in_parent({
              offset_top: offset
            });
          }

          $( window ).resize(function() {
            if ( $( window ).width() < 992 ) {
              $inner.trigger("sticky_kit:detach");
            }else if( $inner.outerHeight() < $images.outerHeight() ) {
              $inner.stick_in_parent({
                offset_top: offset
              });
            }else{
              $images.stick_in_parent({
                offset_top: offset
              });
            } 
          }); 
        }); 
      }); 
    },
    quickViewInit: function() { 
      $(document).on("click", ".open-quick-view", function(e) {
        e.preventDefault();
        var url = $(this).attr("href"),
            item = $(this);
        item.addClass("loading"), SW.product.quickViewLoad(url, item)
      })
    },
    quickViewLoad: function(url, el) { 
      $.ajax({
        url: url,
        dataType: "html",
        type: "GET",
        success: function(data) {
          $.magnificPopup.open({
            items: {
              src: '<div class="mfp-with-anim popup-quick-view">' + data + '</div>', // can be a HTML string, jQuery object, or CSS selector
              type: 'inline'
            },  
            removalDelay: 500, //delay removal by X to allow out-animation
            callbacks: {
              beforeOpen: function() {
                this.st.mainClass = woodmartTheme.popupEffect + ' quick-view-wrapper';
              },
              open: function() {
                countDownInit();
                SW.page.translateBlock('.popup-quick-view');
                if(woodmart_settings.enableCurrency) {
                  currenciesCallbackSpecial(".popup-quick-view span.money");
                }
                productReview();
                setTimeout(function() {
                  SW.page.nanoScroller();
                }, 300);
              },
              close: function() {
                $(".popup-quick-view").empty()
              }
            },
          }); 
        },
        complete: function() {
          el.removeClass("loading");
        },
        error: function() {
          console.log("Quick view error");
        }
      })
    },
  }
  SW.productMedia = {
    productImages: function() {
      var currentImage,
          $productGallery = $('.shopify-product-gallery'),
          $mainImages = $('.shopify-product-gallery__wrapper'),
          $thumbs = $productGallery.find('.thumbnails'),
          currentClass = 'current-image',
          gallery = $('.photoswipe-images'),
          PhotoSwipeTrigger = '.woodmart-show-product-gallery',
          galleryType = 'photo-swipe'; // magnific photo-swipe

      $thumbs.addClass('thumbnails-ready');

      if( $productGallery.hasClass( 'image-action-popup') ) {
        PhotoSwipeTrigger += ', .shopify-product-gallery__image a';
      }

      $productGallery.on('click', '.shopify-product-gallery__image a', function(e) {
        e.preventDefault();
      });

      $productGallery.on('click', PhotoSwipeTrigger, function(e) {
        e.preventDefault(); 
        currentImage = $(this).attr('href');
        if( galleryType == 'magnific' ) {
          $.magnificPopup.open({
            type: 'image',
            image: {
              verticalFit: false
            },
            items: getProductItems(),
            gallery: {
              enabled: true,
              navigateByImgClick: false
            },
          }, 0);
        } 
        if( galleryType == 'photo-swipe' ) {  
          var items = getProductItems(); 
          callPhotoSwipe( getCurrentGalleryIndex(e), items ); 
        } 
      }); 
      $thumbs.on('click', '.image-link', function(e) {
        e.preventDefault(); 
      }); 
      gallery.each(function() {
        var $this = $(this);
        $this.on('click', 'a', function(e) {
          e.preventDefault();
          var index = $(e.currentTarget).data('index') - 1;
          var items = getGalleryItems($this, []);
          callPhotoSwipe(index, items);
        } );
      }); 
      var callPhotoSwipe = function( index, items ) {
        var pswpElement = document.querySelectorAll('.pswp')[0];

        if( $('body').hasClass('rtl') ) {
          index = items.length - index - 1;
          items = items.reverse();
        }  
        var options = { 
          index: index, 
          shareButtons:[
            {id:'facebook', label:woodmart_settings.product_data.share_fb, url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
            {id:'twitter', label:woodmart_settings.product_data.tweet, url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
            {id:'pinterest', label:woodmart_settings.product_data.pin_it, url:'http://www.pinterest.com/pin/create/button/'+
             '?url={{url}}&media={{image_url}}&description={{text}}'},
            {id:'download', label:woodmart_settings.product_data.download_image, url:'{{raw_image_url}}', download:true}
          ]
        };  
        var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
      }; 
      var getCurrentGalleryIndex = function( e ) {
        if( $mainImages.hasClass('owl-carousel') )
          return $mainImages.find('.owl-item.active').index();
        else return $(e.currentTarget).parent().parent().index();
      }; 
      var getProductItems = function() {
        var items = []; 
        $mainImages.find('figure a img').each(function() {
          var src = $(this).attr('data-large_image'),
              width = $(this).attr('data-large_image_width'),
              height = $(this).attr('data-large_image_height'),
              caption = $(this).data('caption'); 
          items.push({
            src: src,
            w: width,
            h: height,
            title: caption
          });
        });
        return items;
      };
      var getGalleryItems = function( $gallery, items ) {
        var src, width, height, title;
        $gallery.find('a').each(function() {
          src = $(this).attr('href');
          width = $(this).data('width');
          height = $(this).data('height');
          title = $(this).attr('title');
          if( ! isItemInArray(items, src) ) {
            items.push({
              src: src,
              w: width,
              h: height,
              title: title
            });
          }
        });
        return items;
      };
      var isItemInArray = function( items, src ) {
        var i;
        for (i = 0; i < items.length; i++) {
          if (items[i].src == src) {
            return true;
          }
        }
        return false;
      }; 
      if( $productGallery.hasClass( 'image-action-zoom') ) {
        var zoom_target   = $( '.shopify-product-gallery__image' );
        var image_to_zoom = zoom_target.find( 'img' ); 
        if ( image_to_zoom.attr( 'width' ) > $( '.shopify-product-gallery' ).width() ) {
          zoom_target.trigger( 'zoom.destroy' );
          zoom_target.zoom({
            touch: false
          });
        }
      }
    },
    productImagesGallery: function() { 
      var $mainImages = $('.shopify-product-gallery__image:eq(0) img'),
          $thumbs = $('.product-images .thumbnails'), // magnific photo-swipe
          $mainOwl = $('.shopify-product-gallery__wrapper'); 
      if( woodmart_settings.product_media.product_image_gallery_slider ) { 
        initMainGallery(); 
      } 
      if( woodmart_settings.product_media.product_image_thumb_slider && woodmart_settings.product_media.product_image_gallery_slider) {
        initThumbnailsMarkup();  
        if( woodmart_settings.product_media.product_image_thumb_position == 'left' && $window.width() > 1024 ) {  
          initThumbnailsVertical(); 
        } else {
          initThumbnailsHorizontal();
        }
      }  
      function initMainGallery() {   
        $('.shopify-product-gallery__wrapper').addClass('owl-carousel').owlCarousel({
          rtl: $('body').hasClass('rtl'),
          items: 1,
          autoplay: false,
          autoplayTimeout:3000,
          loop: false,
          dots: false,
          nav: true,
          autoHeight: false,
          navText:false,
          onRefreshed: function() {
            $(window).resize();
          }
        }); 
      }; 
      function initThumbnailsMarkup() {
        var markup = ''; 
        $('.shopify-product-gallery__image').each(function() {
          markup += '<div class="product-image-thumbnail"><img src="' + $(this).data('thumb') + '" /></div>';
        }); 
        $thumbs.append(markup); 
      }; 
      function initThumbnailsVertical() { 
        $thumbs.slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          vertical: true,
          verticalSwiping: true,
          infinite: false,
        }); 
        $thumbs.on('click', '.product-image-thumbnail', function(e) {
          var i = $(this).index();
          $mainOwl.trigger('to.owl.carousel', i);
        }); 
        $mainOwl.on('changed.owl.carousel', function(e) {
          var i = e.item.index;
          $thumbs.slick('slickGoTo', i);
          $thumbs.find('.active-thumb').removeClass('active-thumb');
          $thumbs.find('.product-image-thumbnail').eq(i).addClass('active-thumb');
        }); 
        $thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
      }; 
      function initThumbnailsHorizontal() {
        $thumbs.addClass('owl-carousel').owlCarousel({
          rtl: $('body').hasClass('rtl'),
          items: 4,
          responsive: {
            979: {
              items: 4
            },
            768: {
              items: 3
            },
            479: {
              items: 3
            },
            0: {
              items: 3
            }
          },
          dots:false,
          nav: true,
          // mouseDrag: false,
          navText: false,
        });

        var $thumbsOwl = $thumbs.owlCarousel(); 
        $thumbs.on('click', '.owl-item', function(e) {
          var i = $(this).index(); 
          $thumbsOwl.trigger('to.owl.carousel', i);
          $mainOwl.trigger('to.owl.carousel', i);
        }); 
        $mainOwl.on('changed.owl.carousel', function(e) {
          var i = e.item.index;
          $thumbsOwl.trigger('to.owl.carousel', i);
          $thumbs.find('.active-thumb').removeClass('active-thumb');
          $thumbs.find('.product-image-thumbnail').eq(i).addClass('active-thumb');
        }); 
        $thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
      }; 
    }
  }  
  SW.onReady = {
    init: function() { 
      SW.page.init();
      SW.collection.init(); 
      SW.productMedia.productImages();
      SW.productMedia.productImagesGallery();
      SW.product.init();
      SW.product.stickyDetails();
    }
  };
  SW.onLoad = {
    init: function() { 
      SW.page.menuOffsets();
    }
  };
  $(document).ready(function(){
    SW.onReady.init();
  });
  $(window).load(function(){
    SW.onLoad.init();
  });
})(jQuery);

var links = document.links;
for (let i = 0, linksLength = links.length ; i < linksLength ; i++) {
console.log('links = ', links[i])
if (links[i].hostname !== window.location.hostname && links[i].hostname !== '') {
links[i].target = '_blank';
links[i].rel = 'noreferrer noopener';
}
}





