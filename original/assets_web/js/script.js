var InfiniteCarousel = function(options) {
    this.baseClass = options.baseClass;
    this.slideCount = 1;
    this.contentWidth = '';
    this.totalContent = '';
    this.slidePos = 0;
    this.slidePosTemp = 0;
    this.carouselUlWidth = 0;
    if (typeof options.moveImage != 'undefined') this.moveImage = parseInt(options.moveImage);
    this.setCarouselWidth();
    this.getSlideCount();
    this.addEvent();
    this.resizeEvent();
};
InfiniteCarousel.prototype = {
    setCarouselWidth: function() {
        var _this = this;
        _this.contentWidth = parseInt($(_this.baseClass).find('ul.carousel-ul li.carousel-li').outerWidth(true));
        _this.totalContent = $(_this.baseClass).find('ul.carousel-ul li.carousel-li').length;
        _this.carouselUlWidth = _this.contentWidth * _this.totalContent;
        $(_this.baseClass).find('ul').width(_this.carouselUlWidth);
    },
    getSlideCount: function() {
        var _this = this;
        var windowWidth = $(window).width();
        if (typeof _this.moveImage != 'undefined' && _this.moveImage) {
            _this.slideCount = _this.moveImage;
        } else {
            if (windowWidth >= 960) {
                _this.slideCount = 4;
            } else if (windowWidth >= 768) {
                _this.slideCount = 3;
            } else if (windowWidth > 600) {
                _this.slideCount = 2;
            } else {
                _this.slideCount = 1;
            }
        }
    },
    addEvent: function() {
        var _this = this;
        $(_this.baseClass).find('.next').unbind('click').bind('click', function(e) {
            e.preventDefault();
            _this.slideCarousel('next')
        });
        $(_this.baseClass).find('.prev').unbind('click').bind('click', function(e) {
            e.preventDefault();
            _this.slideCarousel('prev')
        });
    },
    slideCarousel: function(direction) {
        var _this = this;
        if (_this.contentWidth != '') {
            var movePos = 0;
            if (direction == 'next') {
                _this.slidePosTemp += _this.contentWidth * _this.slideCount;
                if (parseInt(_this.slidePosTemp) > _this.carouselUlWidth || _this.slidePosTemp == 0) {
                    _this.slidePos = 0;
                    _this.slidePosTemp = 0;
                } else if (_this.carouselUlWidth - (_this.slidePosTemp) < _this.contentWidth * _this.slideCount) {
                    _this.slidePos += _this.carouselUlWidth - _this.slidePosTemp;
                } else {
                    _this.slidePos = _this.slidePosTemp;
                }
                movePos = -1 * _this.slidePos
            } else {
                if (_this.slidePos < _this.contentWidth * _this.slideCount && _this.slidePos > 0) {
                    _this.slidePosTemp = 0;
                } else {
                    _this.slidePosTemp -= _this.contentWidth * _this.slideCount;
                }
                if (parseInt(_this.slidePosTemp) < 0) {
                    _this.slidePos = (_this.carouselUlWidth - (_this.contentWidth * _this.slideCount));
                    _this.slidePosTemp = (_this.carouselUlWidth - (_this.contentWidth * _this.slideCount));
                } else if (_this.slidePos < _this.contentWidth * _this.slideCount) {
                    _this.slidePos = 0;
                } else {
                    _this.slidePos = _this.slidePosTemp;
                }
                movePos = -1 * _this.slidePos
            }
            $(_this.baseClass).find('ul.carousel-ul').animate({
                'margin-left': movePos
            }, 500);
        }
    },
    resizeEvent: function() {
        var _this = this;
        $(window).resize(function() {
            _this.setCarouselWidth();
            _this.getSlideCount();
            $(_this.baseClass).find('ul.carousel-ul').css('margin-left', 0);
            _this.slidePosTemp = 0;
        });
    }
};
$(function() {
    var firstSlider = new InfiniteCarousel({
        baseClass: '.infinite-carousel',
        moveImage: 1
    });
});
$(document).ready(function() {
    $(".carousel").swipe({
        swipe: function(event, direction, distance, duration, fingerCount, fingerData) {

            if (direction == 'left')
                $(this).carousel('next');
            if (direction == 'right')
                $(this).carousel('prev');

        },
        allowPageScroll: "vertical"
    });
});

/*
 * Contact submission form in footer
 */
$(document.body).on('click', '.contactSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#contactForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number.",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#contactForm');
            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    if (response == true) {
                        $('#submitContactSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#submitContactSucess').hide();
                        }, 3000);
                    } else {
                        $('#submitContactError').show();
                        setTimeout(function() {
                            $('#submitContactError').hide();
                        }, 3000);
                    }
                }
            });
        }
    });
});
$(document.body).on('click', '.newsBtn', function() {
    $("#newsLetter").validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        messages: {
            email: "Please enter a valid email address."
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#newsLetter');
            $.ajax({
                type: frm.attr('method'),
                url: 'home/newsletter',
                data: frm.serialize(),
                success: function(response) {
                    if (response == "success") {
                        $('#subscribeSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#subscribeSucess').hide();
                        }, 3000);
                    } else if (response == "failed") {
                        $('#subscribeError').show();
                        setTimeout(function() {
                            $('#subscribeError').hide();
                        }, 3000);
                    } else {
                        $('#subscribeError2').show();
                        setTimeout(function() {
                            $('#subscribeError2').hide();
                        }, 3000);
                    }
                }
            });
        }
    });
});

/*
 * Contact Us page Form submission
 */
$(document.body).on('click', '.contactUsSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#contactUsForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            email: {
                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10
            }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            email: "Please enter your email address.",
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#contactUsForm');
            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    if (response == true) {
                        $('#submitContactFormSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#submitContactFormSucess').hide();
                        }, 3000);
                    } else {
                        $('#submitContactFormError').show();
                        setTimeout(function() {
                            $('#submitContactFormError').hide();
                        }, 3000);
                    }
                }
            });
        }
    });
});

/*
 * Header contact form
 */
$(document.body).on('click', '.headerContactFormSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#headerContactForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            email: {
                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block-pop',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            email: "Please enter your email address.",
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#headerContactForm');
            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    if (response == true) {
                        $('#headerContactFormSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#headerContactFormSucess').hide();
                        }, 3000);
                    } else {
                        $('#headerContactFormError').show();
                        setTimeout(function() {
                            $('#headerContactFormError').hide();
                        }, 3000);
                    }
                }
            });
        }
    });
});

/*
 * Slider contact form
 */
$(document.body).on('click', '.sliderContactFormSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#sliderContactForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            email: {

                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
                //                rangelength: [10, 10]
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block-slider',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            email: "Please enter your email address.",
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#sliderContactForm');

            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    //console.log(response);
                    if (response == true) {
                        $('#sliderContactFormSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#sliderContactFormSucess').hide();
                        }, 3000);
                    } else {
                        $('#sliderContactFormError').show();
                        setTimeout(function() {
                            $('#sliderContactFormError').hide();
                        }, 3000);
                    }
                }
            });

        }


    });
});

/**
 * Doctor Detail Page
 */
$(document.body).on('click', '.doctorDetailContactFormSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#doctorDetailContactForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            email: {

                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
                //                rangelength: [10, 10]
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block-slider',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            email: "Please enter your email address.",
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#doctorDetailContactForm');

            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    //console.log(response);
                    if (response == true) {
                        $('#doctorDetailContactFormSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#doctorDetailContactFormSucess').hide();
                        }, 3000);
                    } else {
                        $('#doctorDetailContactFormError').show();
                        setTimeout(function() {
                            $('#doctorDetailContactFormError').hide();
                        }, 3000);
                    }
                }
            });

        }


    });
});

/*
 * Details page contact form
 */
$(document.body).on('click', '.detailContactFormSubmitButton', function() {
    var base_url = $('.site-url').attr('content');
    jQuery.validator.addMethod("lettersonly", function(value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
    }, "Only alphabetical characters");
    $("#detailContactForm").validate({
        rules: {
            name: {
                required: true,
                lettersonly: true
            },
            email: {

                email: true
            },
            phone: {
                required: true,
                number: true,
                minlength: 10,
                maxlength: 10,
                //                rangelength: [10, 10]
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block-slider',
        messages: {
            name: {
                required: 'Please enter your name',
                lettersonly: 'Only alphabetical characters allowed.'
            },
            email: "Please enter your email address.",
            phone: {
                required: "Please enter phone number.",
                number: "Please enter your 10-digit phone number",
                minlength: "Please enter your 10-digit phone number",
                maxlength: "Please enter your 10-digit phone number"
            }
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#detailContactForm');

            $.ajax({
                type: frm.attr('method'),
                url: base_url + '/contacts',
                data: frm.serialize(),
                success: function(response) {
                    //console.log(response);
                    if (response == true) {
                        $('#detailContactFormSucess').show();
                        frm.trigger("reset");
                        setTimeout(function() {
                            $('#detailContactFormSucess').hide();
                        }, 3000);
                    } else {
                        $('#detailContactFormError').show();
                        setTimeout(function() {
                            $('#detailContactFormError').hide();
                        }, 3000);
                    }
                }
            });

        }


    });
});

/*
 * Seminar Subscription popup
 */
$(document.body).on('click', '.submitSubscribeSeminar', function() {
    $("#subscribeSeminar").validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        highlight: function(element) {
            $(element).closest('.input-group').addClass('has-error');
        },
        unhighlight: function(element, errorClass, validClass) {
            $(element).closest('.input-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block-pop',
        messages: {
            email: "Please enter your email address."
        },
        errorPlacement: function(error, element) {
            if (element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        },
        submitHandler: function(form) {
            var frm = $('#subscribeSeminar');
            $.ajax({
                type: frm.attr('method'),
                url: 'home/subscribe_seminar',
                data: frm.serialize(),
                success: function(response) {
                    console.log(response);
                    if (response == "success") {
                        $('#subscribeSeminarSucess').show();
                        setTimeout(function() {
                            $('#subscribeSeminarSucess').hide();
                        }, 3000);
                    } else if (response == "failed") {
                        $('#subscribeSeminarError').show();
                        setTimeout(function() {
                            $('#subscribeSeminarError').hide();
                        }, 3000);
                    } else {
                        $('#subscribeSeminarError2').show();
                        setTimeout(function() {
                            $('#subscribeSeminarError2').hide();
                        }, 3000);
                    }
                }
            });
        }
    });
});
$(document.body).on('click', '.seminarSubscribe', function() {
    var seminarId = $(this).attr('data-id');
    $.ajax({
        type: 'POST',
        url: 'home/get_seminar_detail',
        data: {
            "seminar_id": seminarId
        },
        beforeSend: function(xhr) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
        }
    }).done(function(data) {
        $("#seminarsubscriptionpop").html(data);
        $('#subscribe_seminar').modal('show');
    });
});
$('.dropdown-toggle').dropdown();