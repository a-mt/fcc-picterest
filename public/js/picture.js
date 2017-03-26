var FeedPicture = {
    placeholdImg: false,
    isInit: false,

    /* Bind events */
    init: function() {
        FeedPicture.initFeed();

        $('.grid').on('click', '.js-delete', FeedPicture.delete);
    },

    /* Init Masonry (pinterest-like grid) */
    initFeed: function() {
        var $container = $('.grid');
    
        /* Replace broken images link with default img */
        FeedPicture.placeholdImg = $container.data('err');
        $('img').on('error', FeedPicture.handleBrokenLink);

        /* Display images once masonry handled them */
        $container.on('layoutComplete', function(e, items){
            for(var i=0; i<items.length; i++) {
                items[i].element.classList.add('on');
            }
            if(!FeedPicture.isInit) {
                FeedPicture.isInit = true;
                FeedPicture.initScroll($container);
            }
        });

        /* Load grid */
        $container.imagesLoaded(function(){
            setTimeout(function(){
                $container.masonry({itemSelector: '.item'}); 
            }, 200);
        });
    },

    /* Either remove or replace image with placeholder */
    handleBrokenLink: function() {
        if(FeedPicture.placeholdImg) {
            $(this).attr('src', 'http://i.imgur.com/Qijs1ss.png');
        } else {
            this.parentNode.remove();
        }
    },

    /* Add paging through scroll */
    initScroll: function($container) {

        $container.infinitescroll({
          navSelector  : '#page-nav',    // selector for the paged navigation 
          nextSelector : '#page-nav a',  // selector for the NEXT link (to page 2)
          itemSelector : '.item',        // selector for all items you'll retrieve
          loading: {
              finishedMsg: 'No more pictures to load.'
            }
          }, function(newElements) {
            $container.imagesLoaded(function(){

              // Check broken links or append
              for(var i=0; i<newElements.length; i++) {
                  var elem = newElements[i];
                  var img  = elem.firstChild;

                  if(img.width < 1) {
                      FeedPicture.handleBrokenLink.bind(img);
                  } else {
                      $container.masonry('appended', elem);
                  }
              }

              // Trigger infinitescroll to fill the page
              if($(document).height() <= $(window).height()) {
                  $container.infinitescroll('retrieve');
              }
            });
          }
        );
        $container.infinitescroll('retrieve');
    },

    /* Delete a picture */
    delete: function() {
       if(!confirm('Are you sure ?')) {
           return;
       }
       var $btn = $(this);
       $.ajax({
           url: '/picture/delete',
           method: 'POST',
           data: {
               id: $btn.data('id')
           },
           success: function(data) {
               $btn.closest('.grid').masonry('remove', $btn.closest('.item')).masonry();
           },
           error: function(xhr) {
               alert('Something went wrong (' + xhr.status + ' ' + xhr.responseText + ')');
           }
       });
    }
};

$(document).ready(function(){
    FeedPicture.init();
});

/** --------------------------------------------------- **/
var EditPicture = {
    url: false,

    // Bind events
    init: function() {
        $('.js-add-picture').on('keyup keypress', function(e){
            var code = e.keyCode ? e.keyCode : e.which;

            // On enter : check image
            if(code == 13) {
                if(e.type == 'keyup') {
                    if(!this.checkValidity()) {
                        this.reportValidity();
                    } else {
                        EditPicture.add();
                    }
                } else if(this.value == EditPicture.url) {
                    return true;
                }

                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        $('.js-add-picture').on('blur', EditPicture.add);
        $('.js-refresh-picture').on('click', EditPicture.add);
    },

    // Display the picture corresponding to the given link
    add: function() {
        var url = $('.js-add-picture').val();

        // Create a new element
        var img = new Image();
        img.onload = function(){
            EditPicture.url = url;

            $('.js-picture').html(img);
            $('.js-submit').removeAttr('disabled');
        };
        img.onerror = function(err){
            $('.js-picture').html('Could not load the given url');
            $('.js-submit').attr('disabled',  'disabled');
        };
        img.src = url;
    }
};

$(document).ready(function(){
    EditPicture.init();
});