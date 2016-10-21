	// var s,
// 	NewsWidget = {
// 
// 	  settings: {
// 		numArticles: 5,
// 		articleList: $("#article-list"),
// 		moreButton: $("#more-button")
// 	  },
// 
// 	  init: function() {
// 		s = this.settings;
// 		this.bindUIActions();
// 	  },
// 
// 	  bindUIActions: function() {
// 		s.moreButton.on("click", function() {
// 		  NewsWidget.getMoreArticles(s.numArticles);
// 		});
// 	  },
// 
// 	  getMoreArticles: function(numToGet) {
// 		// $.ajax or something
// 		// using numToGet as param
// 	  }
// 
// 	};

var RestorePost = function(){
	
	var _restore = function(el){
		var type = el.data("type"),
			post_id = el.data("post")
		
		$.ajax({
			type: "POST",
			url: "/restore_post/",
			dataType: "json",
			data: { "type": type, "post_id": post_id},
			success: function(data) {
				// if(data.active == "True"){
// 				updatePage()
// 				}
			}
		});
	}
	
	var bind = function(handle){
		handle.find(".bubble-deleted-user").on("click", function(){
			_restore($(this))	
			
		});
	}
	
	return{
		bind: bind
	}

}

function restorePost(){
	
		$(".bubble-deleted-user").off("click");
		$(".bubble-deleted-user").on("click", function(){
			console.log($(this).data("type"))
			
			var type = $(this).data("type")
			
			if(type == 'response'){
				post_id = $(this).data("post")
			}else{
				post_id = $(this).data("post")
			}
			
			$.ajax({
				type: "POST",
				url: "/restore_post/",
				dataType: "json",
				data: { "type": type, "post_id": post_id},
				success: function(data) {
					//if(data.active == "True"){
					//updatePage()
					//}
				}
			});
	
		});
	}///end of restorePost
/*	
function loadThread(pKey, pValue){

	/////////evaluate local storage here!!!!, values 
	pData = {}
	var order_text = "";
	for (var i = 0; i < localStorage.length; i++){
    	
    	var key = localStorage.key(i);
    	var value = localStorage.getItem(key);
    	
    	if (value != ""){
			pData[key] = value;
		
			if (key == "pop"){
				$("#order").html("popularity");
			}else if(key == "pub"){
				$("#order").html("ending soon");
			}else{
				$("#order").html("most recent");
			}
			
			if(key == "my"){
				order_text += "<div id='my'>my convos<div class='close-filter'></div></div>";
			}
			if(key == "faves"){
				order_text += "<div id='faves'>favorite users<div class='close-filter'></div></div>";
			}
			if(key == "contains"){
				order_text += '<div id="contains">"'+value+'"<div class="close-filter"></div></div>';
				
			}
		}	
	}
	$("#filter").html(order_text)
	
 	
	 ///////close-filter by tag in drop-top
	$(".close-filter").click(function(){
		var blank = "";
		localStorage.setItem($(this).parent().attr('id'), blank);
		loadThread($(this).parent().attr('id'), blank);
		$(".sorter").find("[data-"+$(this).parent().attr('id')+"]").css({background:'rgb(252,252,252)','border-bottom':'1px solid transparent', left:"0"}).children('span').first().css({width:""});
		console.log($(".sorter").find("[data-"+$(this).parent().attr('id')+"]"))
	});
	
	if (pValue != ""){
		pData[pKey] = pValue;
	}
	
		$.ajax({
            type: "GET",
            url: "/thread_list",
            data: pData,
            success: function(data) {
				console.log("data length: ", data.length)
            	if(pKey == "start_end" ){
            		$(".main-feed").append('<div id="'+pValue+'">' + data + '</div>')
            	}else{
            		if(data.length > 31 ){
            			$(".main-feed").html('<div id="0,10">' + data + '</div')
            		}else if(data.length == 31){
            			$(".main-feed").html('<div id="no-results"><h1>SORRY, NO POSTS MATCH YOUR QUERY :(</h1></div>')
            		}else{
						//do nothing. this is for when no user is logged in
            		}
            		
            	}
            	
            	
            	
            	$("#id_title").val("")
            	$("#id_text").val("")
            	
            	
            	window.getComputedStyle($(".center")[0]);
            	$(".center")[0].style.opacity = 1;
            	
            				
						function setNavBar(){
						
							///////attach window events
							var last_ws = 0;
							
							$(window).on('touchmove', function(e){
								var this_ws = $(this).scrollTop();
								console.log("window TOUCHmove!!!!", e, last_ws, this_ws )
							
								if(last_ws < 0){
									$("body").css({background:"#595959"})
								}else if(last_ws > 0){
									$("body").css({background:"#fff"})
								}
								last_ws = this_ws
								
								
							});//////end window touchmove
							
							$(window).on('touchend', function(e){
								
								console.log(e.target.parentNode.parentNode.className, e.target.parentNode.parentNode.className, e.target.parentNode.parentNode.parentNode.className, e.target.parentNode.parentNode.parentNode.parentNode.className,  e.target.parentNode.parentNode.parentNode.parentNode.parentNode.className)
								
								var eventArray = [e.target.parentNode.parentNode.className, e.target.parentNode.parentNode.className, e.target.parentNode.parentNode.parentNode.className, e.target.parentNode.parentNode.parentNode.parentNode.className]
								
								console.log(eventArray[$.inArray("user-view", eventArray)]);
								
								if($.inArray("user-view", eventArray) != -1 || $.inArray("main-feed", eventArray) != -1){
								console.log($("."+eventArray[$.inArray("user-view", eventArray)]), $("."+eventArray[$.inArray("main-feed", eventArray)]));	
									
									///define el
									var el = $.inArray("user-view", eventArray) != -1 ? $("."+eventArray[$.inArray("user-view", eventArray)]) : $("."+eventArray[$.inArray("main-feed", eventArray)]) 
									
									if(last_ws > 1 ){
									
										console.log("Window TOUCHend!!!!!!", e, el,"last_ws: ",last_ws)
									
										var scroll_dist = ($(this).scrollTop() + el.scrollTop()) - 44
						
										el.animate({ scrollTop: scroll_dist}, 500, 'easeOutQuint', function initElScroll(e){
											el.off("scroll", initElScroll);
											
											el.css({overflow:"scroll"})
							
											$("html, body").animate({ scrollTop: 1}, 500, 'easeOutQuint', function initWindowScroll(){
												$("html, body").off("scroll", initWindowScroll);
		
											});
										});
									
									
									}else if(last_ws < 1 ){
										el.css({overflow:"hidden"});
										el.off("touchmove")
										el.off("touchend")
										
									}else{
								
										el.on("touchmove", function(e){
											e.stopPropagation();
										
										})
										el.on("touchend", function(e){
											e.stopPropagation();
											if($(window).scrollTop() > 1){
												setTimeout(function(){
													$("html, body").animate({ scrollTop: 1}, 500, 'easeOutQuint', function initWindowScroll(){
														$("html, body").off("scroll", initWindowScroll);
													});
												}, 1000)
											}else if($(window).scrollTop() < 1){
												el.css({overflow:"hidden"});
												el.off("touchmove")
												el.off("touchend")
											}
										})
									}
					
								}/////end if event in array			
							});//////end window touchend
							
						}
						
						function initMobile(){
						
							///main post form css fixes
							$(".post-form-container").css({position:"fixed", width:"50%"})
							
							///fixed sporadic iphone behavior when textarea is pushed
							$("#id_text").on("focus", function(){
								//event.stopPropagation();
								
								$(".post-form-container").css({position:"absolute", width:"100%"})
							}).on("blur", function(){
								$(".post-form-container").css({position:"fixed", width:"50%"})
							});
							
							////////initially set overflow to hidden
							$(".user-view").css({overflow:"hidden"})
							$(".main-feed").css({overflow:"hidden"})
							
				
							////start
							setNavBar()
							
						}///end initMobile
							
							
						if('ontouchstart' in document.documentElement){
							
							initMobile()
							
						}
						
			

        		
				//////open threads	
				$('.main-feed').children().last().find(".thread").on("click",function(){
					
					var curr_id = this.id
					var curr_url = "/thread/"+curr_id+"/";
					var thread = $(this)
					//var handle = $(this).children().last().children().first();
					
					$("#thread-div-pop").html($(this).html());
					$("#thread-div-pop").children(".post-user").append("<span class='close-btn'></span>")
					///add close button to top of open thread
					$(".close-btn").on("click",function(){
						closeThread();
					});
					//remove triange from responses class
					$("#thread-div-pop").find(".rotate-arrow").remove()
					
					//var handle = $("#thread-div-pop").find(".details")
					var handle = $("#thread-div-pop").find(".details")
					
					///get position of thread you are clicking on
					this_thread_position = $(this).offset().top - $(window).scrollTop() +"px"
					
					$("#thread-wrapper-pop").css({display:"block"});
					$("#thread-div-pop").css({display:"block", top:this_thread_position, height:thread.height()+"px"});
					
					
					////
					$.ajax({
						type: "GET",
						url: curr_url,
						success: function(data) {
							//console.log(handle);
							
							//showResponses(thread,data)
							handle.html(data);
							
							//call the function attach_details function once during loadThread
							attach_details(handle);
							
							// use instead of settimeout to make magic transition happen
							// window.getComputedStyle($(this)[0]);
					
							//transition magic
							setTimeout(function () {
								var center_check = parseInt($(".center").css("width").replace("px", "")) / $(window).width();

								$("#thread-wrapper-pop").css({opacity:1});////////////////////////////////////////////"calc(100vh - "+thread.height()+"px)"
								
								if(center_check == 1){
									$("#thread-div-pop").css({display:"block", top:"0", width:"100%", left:"0", height:"100vh"});// , height:"calc(100vh - 34px)"
								}else if(center_check < 1 && center_check > 0.5){
									
									$("#thread-div-pop").css({display:"block", top:"0", width:"70%", left:"30%", height:"100vh"});// , height:"calc(100vh - 34px)"
								}else{
									$("#thread-div-pop").css({display:"block", top:"0", width:"47%", left:"32%", height:"100vh"});// , height:"calc(100vh - 34px)"
								}
								handle.parent().css({height:"calc(100vh - 163px)"});
								handle.css({height:"calc(100vh - 163px)"});
							}, 30);
							
							//attach charCount to response form
							$("#id_text_r").on("keyup", function(){
								charCount($(this));	
							});
							
							///attach scroll listener for closing of thread
							//closeThreadScroll();
				
							////////add thread to localStorage if open
							if(handle.html() != "" ){
								localStorage.setItem('open_thread', curr_id);
							}else{
								localStorage.setItem('open_thread', '');
							}
							
// 								///////scroll to the bottom response
							handle.find('textarea').click(function(){
								Scroller.myScroller(handle.children('.response-container'), handle.children('.response-container').prop('scrollHeight')-handle.children('.response-container').parent().height())
							});
							
							/////attach click event to deleted threads 	
							restorePost();
							
							function addResponse(){  
								
								//console.log($(this).parent().prev())
								curr_container = $('.resp-btn').parent().prev();
								curr_text = $('.resp-btn').parent().children('p').children("#id_text_r").val();
								clear_text = $('.resp-btn').parent().children('p').children("#id_text_r")
								
								if(curr_text.length < 32){
									curr_title = curr_text;
								}else{
									curr_title = curr_text.slice(0,32) + "...";
								}
								curr_is_thread = $('.resp-btn').parent().children('p').children("#id_is_thread_r").val();
								
			
								$.ajax({
									type: "POST",
									url: "/ajax/add/",
									dataType: "json",
									data: { "id": curr_id, "title": curr_title, "text": curr_text, "is_thread":  curr_is_thread },
									success: function(response) {
										if(response.active == "True"){
											$.ajax({
												type: "GET",
												url: "/thread_detail_detail/"+curr_id+"/",
												success: function(data) {
													curr_container.html(data)
													//console.log();
													clear_text.val("")
													console.log(curr_container.prop('scrollHeight'), curr_container.parent().height())
													Scroller.myScroller(curr_container, curr_container.prop('scrollHeight')-curr_container.parent().height())
	// 													curr_container.css({'border':'1px solid purple'})
													
													attach_details(handle);
												
												
												}
											});
										}
											
									},
									error: function(XMLHttpRequest, textStatus, errorThrown) { 
										console.log(curr_container)
										console.log({ "title": curr_title, "text": curr_text, "is_thread":  curr_is_thread })
									}
								});
							}
							$('.resp-btn').click(function(){
								addResponse()
							});////end of POST
							
							$("#id_text_r").keydown(function(e){
								if(e.keyCode == '13' )
								{
									e.preventDefault();
									addResponse($(this))
								}
							});
							
							
						}
					});
				
				})
		    }
        });
	
	}/////////end of loadThread
	*/