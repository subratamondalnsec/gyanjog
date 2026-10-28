(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'smartmenus'], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($) {
    $.extend($.SmartMenus.Bootstrap = {}, {
        keydownFix: false,
        init: function() {
            var $navbars = $('ul.navbar-nav:not([data-sm-skip])');
            $navbars.each(function() {
                var $this = $(this),
                    obj = $this.data('smartmenus');
                if (!obj) {
                    $this.smartmenus({
                        subMenusSubOffsetX: 2,
                        subMenusSubOffsetY: -6,
                        subIndicators: false,
                        collapsibleShowFunction: null,
                        collapsibleHideFunction: null,
                        rightToLeftSubMenus: $this.hasClass('navbar-right'),
                        bottomToTopSubMenus: $this.closest('.navbar').hasClass('navbar-fixed-bottom')
                    }).on({
                        'show.smapi': function(e, menu) {
                            var $menu = $(menu),
                                $scrollArrows = $menu.dataSM('scroll-arrows');
                            if ($scrollArrows) {
                                $scrollArrows.css('background-color', $(document.body).css('background-color'));
                            }
                            $menu.parent().addClass('open');
                        },
                        'hide.smapi': function(e, menu) {
                            $(menu).parent().removeClass('open');
                        }
                    });

                    function onInit() {
                        $this.find('a.current').parent().addClass('active');
                        $this.find('a.has-submenu').each(function() {
                            var $this = $(this);
                            if ($this.is('[data-toggle="dropdown"]')) {
                                $this.dataSM('bs-data-toggle-dropdown', true).removeAttr('data-toggle');
                            }
                            if ($this.is('[role="button"]')) {
                                $this.dataSM('bs-role-button', true).removeAttr('role');
                            }
                        });
                    }
                    onInit();

                    function onBeforeDestroy() {
                        $this.find('a.current').parent().removeClass('active');
                        $this.find('a.has-submenu').each(function() {
                            var $this = $(this);
                            if ($this.dataSM('bs-data-toggle-dropdown')) {
                                $this.attr('data-toggle', 'dropdown').removeDataSM('bs-data-toggle-dropdown');
                            }
                            if ($this.dataSM('bs-role-button')) {
                                $this.attr('role', 'button').removeDataSM('bs-role-button');
                            }
                        });
                    }
                    obj = $this.data('smartmenus');
                    obj.isCollapsible = function() {
                        return !/^(left|right)$/.test(this.$firstLink.parent().css('float')) && this.$root.css('display') == 'block';
                    };
                    obj.refresh = function() {
                        $.SmartMenus.prototype.refresh.call(this);
                        onInit();
                        detectCollapsible(true);
                    };
                    obj.destroy = function(refresh) {
                        onBeforeDestroy();
                        $.SmartMenus.prototype.destroy.call(this, refresh);
                    };
                    if ($this.is('[data-sm-skip-collapsible-behavior]')) {
                        obj.opts.collapsibleBehavior = 'toggle';
                    }
                    var winW;

                    function detectCollapsible(force) {
                        var newW = obj.getViewportWidth();
                        if (newW != winW || force) {
                            var $carets = $this.find('.caret');
                            if (obj.isCollapsible()) {
                                $this.addClass('sm-collapsible');
                                if (!$this.is('[data-sm-skip-collapsible-behavior]')) {
                                    $carets.addClass('navbar-toggle sub-arrow');
                                }
                            } else {
                                $this.removeClass('sm-collapsible');
                                if (!$this.is('[data-sm-skip-collapsible-behavior]')) {
                                    $carets.removeClass('navbar-toggle sub-arrow');
                                }
                            }
                            winW = newW;
                        }
                    }
                    detectCollapsible();
                    $(window).on('resize.smartmenus' + obj.rootId, detectCollapsible);
                }
            });
            if ($navbars.length && !$.SmartMenus.Bootstrap.keydownFix) {
                $(document).off('keydown.bs.dropdown.data-api', '.dropdown-menu');
                if ($.fn.dropdown && $.fn.dropdown.Constructor) {
                    $(document).on('keydown.bs.dropdown.data-api', '.dropdown-menu:not([id^="sm-"])', $.fn.dropdown.Constructor.prototype.keydown);
                }
                $.SmartMenus.Bootstrap.keydownFix = true;
            }
        }
    });
    $($.SmartMenus.Bootstrap.init);
    return $;
}));