(function($) {
	// Document ready
	$(document).ready(function() {

		// Set hero wrapper to window height
		$('.hero .grid').height($(window).height());

		// Tabbed functionality
		$('.tab-list').on('click', function() {
			var _this = $(this),
					i = _this.index();

			// Remove and add active class to item
			_this.addClass('active').siblings().removeClass('active');
			$('.tab-item').hide().eq(i).show();
		});

		// Waypoints handler to animate images
		$('.unique, .collection, .stay-tuned').waypoint({
			offset: '80%',
			triggerOnce: true,
			handler: function(direction) {
				var _this = $(this),
						animation = _this.find('.image').data('animate');

				_this.find('.image').css('visibility', 'visible').addClass(animation);
			}
		});

		// Scroll to buttons
		$('.scroll-to').on('click', function() {
			scrollTo($(this).data('scroll-to'));
			return false;
		});

		// Form submission handler
		$('.contact-form .form').on('submit', function() {
			var _this = $(this),
					name = _this.find('.form-name').val(),
					surname = _this.find('.form-surname').val(),
					email = _this.find('.form-email').val(),
					telephone = _this.find('.form-telephone').val(),
					message = _this.find('.form-message').val(),
					fax = _this.find('.form-fax').val();

			// Reset error classes
			_this.find('.error').removeClass('error');

			// Stop if fax is not empty
			if (fax !== '') {
				return false;
			}

			// Verify required fields
			if (name === '' || surname === '' || email === '' || message === '') {
				_this.find('.required').each(function() {
					if ($(this).val() === '') {
						$(this).addClass('error');
					}
				});

				return false;
			}

			// Verify email address
			if (!validEmail(email)) {
				_this.find('.form-email').addClass('error');

				return false;
			}

			$.ajax({
				type: 'POST',
				url: '../php/mail.php',
				data:'name=' + name + '&surname=' + surname + '&email=' + email + '&telephone=' + telephone + '&message=' + message,
				success: function(data) {
					if (data === 'success') {
						_this.hide().parent().find('.form-success').show();
					}
				}
			});

			return false;
		});

	});

	// Email validation
	function validEmail(email) {
    var pattern = new RegExp(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
    return pattern.test(email);
  }

  // Scroll to specific section
  function scrollTo(classname) {
  	$('html, body').animate({
        scrollTop: $('.'+classname).offset().top
    }, 1000);
  }

})(jQuery);