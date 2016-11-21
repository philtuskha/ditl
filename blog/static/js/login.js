$(document).ready(function() {
	if('ontouchstart' in document.documentElement){
		var home_screen_save = $('#home-screen-save');
	
		$('.logged-out').on('scroll', function(){
			console.log($(this).scrollTop(), $(window).innerHeight())
			if($(this).scrollTop() > $(window).innerHeight()/2){
				home_screen_save.css({opacity:"1"});
			}else{
				home_screen_save.removeAttr('style');
			}
		});
	
		home_screen_save.on('click', function(){
			$('#save-instructions').css({height:"auto"});
		
		});
	
	}

});