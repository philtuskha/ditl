$(document).ready(function() {
	
	///hacky way to make this site look right in phone
	if ($(window).width() < 600) { 
		$('meta[name=viewport]').attr('content','initial-scale=0.8, maximum-scale=0.8, user-scalable=no');
	} 
	
	
	// $('.content-wrap').on('touchmove', function (e){
// 		if(!$('.user-view').has($(e.target)).length){
// 			e.preventDefault();
// 		}else if(!$('.main-feed').has($(e.target)).length){ 
// 			e.preventDefault();
// 		}
// 	});
		// $('#fix').on('touchmove',function(e){
// 		if(!$('.scroll').has($(e.target)).length)
// 			e.preventDefault();
// 	});
	
	$("circle").css({'strokeDashoffset':$("#user-top>ul").data("timediff")})

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
            	

/////maintain good desktop working example
        			// function toggleHeader(el){
//         
// 						
// 						function wheelScroll(delta){
// 							var move = $("header").height() + delta ;
// 							var move_wrap = $(".content-wrap").height() - delta ;
// 							
// 							 //console.log(delta, $(".left-wrap").css("height"))
// 							if(delta < 0){
// 								
// 								$("header").css({height: move + "px"})
// 								$(".content-wrap").css({height: move_wrap + "px"});
// 								
// 								if($("header").height() <= 0){
// 									//default
// 									$(".content-wrap").css({height: ($(window).innerHeight() - 36)+"px"});
// 									el.css({overflow:"scroll"})
// 									el.off('mousewheel touchstart touchmove')
// 								}
// 								
// 							}else{
// 						
// 								$("header").css({height: move + "px"})
// 								$(".content-wrap").css({height: move_wrap + "px"});
// 								
// 								
// 								
// 								if($("header").height() > $("header>div").height()){
// 									//defaults
// 									$("header").css({height: $("header>div").height() + "px"})
// 									$(".content-wrap").css({height: ($(window).innerHeight() - ($("header>div").height() + 36))+"px"});
// 								
// 									el.css({overflow:"scroll"})
// 									el.off('mousewheel touchstart touchmove')
// 								}
// 							}
// 						}
// 						
// 						function wheelCheck(){
// 							if('ontouchstart' in window || navigator.maxTouchPoints){
// 								el.on("touchstart", function(e) {
// 									var startingY = e.originalEvent.touches[0].pageY;
// 									console.log("start", e)
// 									el.on("touchmove", function(e) {
// 										//e.preventDefault;
// 										console.log("move", e)
// 										currentY = e.originalEvent.touches[0].pageY;
// 										var delta = currentY - startingY;
// 										
// 										wheelScroll(delta);
// 										
// 									});
// 								});
// 								
// 							}else{
// 							
// 								
// 								el.on('mousewheel', function(e){
// 									e.preventDefault;
// 									
// 									var delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -e.detail
// 								
// 									wheelScroll(delta);
// 								});
// 								
// 							}
// 						}
// 						
// 						
// 						var lastScrollTop = 0;
// 						///////on scroll function
// 						el.on('mousewheel touchmove scroll', function(event){
// 							console.log(event)
// 							var scroll_max = $(this).children().last().height() - $(this).height();
// 							var st = $(this).scrollTop();							
// 							
// 							/////confine for mobile stretch scrolling
// 							if(st > 0 && st < scroll_max){
// 								if(st > lastScrollTop ){ //////scrolling up 
// 										
// 									if($("header").height() > 0 && $("header").height() < $("header>div").height() + 1){
// 										el.css({overflow:"hidden"})
// 										wheelCheck()
// 									} 
// 								}else{ //////scrolling down
// 									
// 									if($("header").height() >= 0 && $("header").height() < $("header>div").height()){
// 										el.css({overflow:"hidden"})
// 										wheelCheck()
// 									} 
// 								}
// 								lastScrollTop = st
// 							}
// 						});
// 					}	

							
						function toggleHeader(el){
						
							/////set up styles for mobile						
							el.css({overflow:"hidden"})
							
							///main post form
							$(".post-form-container").css({position:"fixed"})
							
							///fixed sporadic iphone behavior when textarea is pushed
							$("#id_text").on("focus", function(){
								$(".post-form-container").css({position:"absolute"})
							}).on("blur", function(){
								$(".post-form-container").css({position:"fixed"})
							});
							
							//
							
							///attach only once
							if(el.length == $(".user-view").length){
								var last_ws = 0;
								$(window).on('touchmove', function(e){
									var this_ws = $(this).scrollTop();
									console.log("TOUCHStart!!!!", e, last_ws, this_ws )
									
									if(last_ws < 0){
										$("body").css({background:"#595959"})
									}else if(last_ws > 0){
										$("body").css({background:"#fff"})
									}
									last_ws = this_ws
								});
								
								$(window).on('touchend', function(e){
									console.log("TOUCHEND!!!!!!", e, e.target)
									
									if(last_ws < 0){
										el.css({overflow:"hidden"})
										
									}else if(last_ws > 0){
										
										
										if(e.target.id != "id_text"){
											
											
											
											
											$("body").css({"margin-top":"-"+($(this).scrollTop()-24)+"px"})
											
											console.log("RECOGNIZE STYLE ATTR",$("body").attr("style"))
											console.log("window scroll top",$(this).scrollTop())

											 setTimeout(function(){
												$("body").css({transition:"margin-top 0.7s", "margin-top":"0px"})
												// myScroller(el, $(this).scrollTop());
												el.scrollTop($(this).scrollTop());
												
												$( "body" ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
													 $(window).scrollTop(0)
													$("body").css({transition: "none !important"})
													$("body").removeAttr("style")
													
													el.css({overflow:"scroll"})
													
													
													console.log("done with window fix")
												});							
// 								
 											}, 2000);
										
										}
									}

										
								});
								
							}
							
							function touchScroll(diff, el){
								
							
								//prevent wild swings in header height
								if(diff > $("header>div").height()/2){
									diff = 30
								}else if(diff < "-"+$("header>div").height()/2){
									diff = -30
								}
								// console.log
// 								
							
								// $(".content-wrap").css({height: "calc(100vh + 200px)"});
									
								console.log($(window).height(), $("#viewport").height());	
								if(diff > 0){
									
									
									
									///sizing the header
									if($("header").height() <= 0){
										$("header").css({height:"0px"})
										
									}else{
										$("header").css({height:($("header").height() - diff)+"px"})
									}
									
								}else{
									if($("header").height() >= $("header>div").height()){
										$("header").css({height:$("header>div").height()+"px"})
										
									}else{		   
										$("header").css({height:($("header").height() - diff)+"px"})
										
										
										
									}
									
								}
								
							}
						
							function wheelCheck(diff, el, event){
								touchScroll(diff, el);
								
								
							
							};
							var diff = 0
							
							el.on('touchend', function(e){
							
								if(diff > 0){
									$("header").css({transition:"height 0.2s"})
									window.getComputedStyle($("header")[0]);
									$("header").css({height:"0px"})
									$( "header" ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
										$( "header" ).css({transition: "none !important"});
										// window.getComputedStyle($(".content-wrap")[0]);
// 										$(".content-wrap").css({height: "calc(100vh - 36px)"});
									
									});
									
								}else{
									$("header").css({transition:"height 0.2s"})
									window.getComputedStyle($("header")[0]);
									$("header").css({height:$("header>div").height()+"px"})
									$( "header" ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
										$( "header" ).css({transition: "none !important"});
										// window.getComputedStyle($(".content-wrap")[0]);
// 										$(".content-wrap").css({height: "calc(100vh - 111px)"});
									
									});
								}
							
							});
						
							var lastScrollTop = 0;
							el.on('touchmove', function(event){ ///mousewheel DomMouseWheel
							
								$(".content-wrap").css({height: "calc(100vh + 100px"});
								// $(window).scrollTop(el.scrollTop());
								//event.preventDefault();
								var scroll_max = $(this).children().last().height() - $(this).height();
								
								
								
								
								
								var st = $(this).scrollTop();
								diff =	st - lastScrollTop; 						
								console.log("edges: ", el.scrollTop(), $(this).children().last().height() - $(this).height() )
								
								if(st > lastScrollTop ){ //////scrolling up 	
										
										wheelCheck(diff, el, event)

								}else if(st <= lastScrollTop ){ //////scrolling down
										
										wheelCheck(diff, el, event)

								}
								lastScrollTop = st
							
							});
						}
					
						if('ontouchstart' in document.documentElement){
							toggleHeader($(".user-view"))
							toggleHeader($(".main-feed"))
							
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
								myScroller(handle.children('.response-container'), handle.children('.response-container').prop('scrollHeight')-handle.children('.response-container').parent().height())
							});
								
					
							
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
									data: { "title": curr_title, "text": curr_text, "is_thread":  curr_is_thread },
									success: function(response) {

										$.ajax({
											type: "GET",
											url: "/thread_detail_detail/"+curr_id+"/",
											success: function(data) {
												curr_container.html(data)
												//console.log();
												clear_text.val("")
            									console.log(curr_container.prop('scrollHeight'), curr_container.parent().height())
												myScroller(curr_container, curr_container.prop('scrollHeight')-curr_container.parent().height())
// 													curr_container.css({'border':'1px solid purple'})
												attach_details(handle);
												
												
											}
										});
											
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
									addResponse($(this))
								}
							});
							
							
						}
					});
				
				})
		    }
        });
	
	}/////////end of loadThread
	

	///load middle threads 
    loadThread('big', 'dummy');

	
	
	
	// update user view function
	function reload(curr_position, is_scroll){
		
		$.ajax({
            type: "GET",
            url: "/user_view/",
            success: function(data) {
            	$("#user").html(data)
            	
            	///get time since last post
            	currThreadTime($("#user-top>ul").data("timediff"));
            	$(".user-view").scrollTop(curr_position);
				// if(is_scroll){
// 					/////scroll user-view to look like texting
// 					$(".user-view").scrollTop(curr_position);
// 					setTimeout(function(){
// 						scroll_diff = $(".user-box-container").height() - $(".user-view").height();
// 						myScroller($(".user-view"), scroll_diff);        	
// 					},30);
//             	}else{
//             		$(".user-view").scrollTop(curr_position);
//             	}
				
								
				
				////making spacer smoothly transition
				$("#user-view-spacer").height($(".user-view").height() - $(".user-box-container").height() + $(".user-box-container").children().first().height())
				window.getComputedStyle($("#user-view-spacer")[0]);
				$("#user-view-spacer").height($(".user-view").height() - $(".user-box-container").height())
				
				attach_details($('.user-box-container'));
				

	
        	}
        });
    }///end reload()
    
    
    //////initial load left side user-view
    reload($(".user-view").scrollTop(), true);
 
 	function updatePage(){
 		//check for local storage 'curr_page_state' deal with user first time visiting the site with no local storage item 'curr_page_state'
 		//console.log(localStorage.getItem('curr_page_state') === null);
		if(localStorage.getItem('curr_page_state') === null){
			
			var state = {};
			localStorage.setItem('curr_page_state', JSON.stringify(state))
			last_state = state;
			
		}else{
			var state = localStorage.getItem('curr_page_state');
			var last_state = []
			last_state = JSON.parse(state);
		}

				
		
 		$.ajax({
			type: "POST",
			url: "/update_page/",
			dataType: "json",
			data: last_state,
			success: function(data) {
 
				//console.log(data, last_state)				
				//update thread
				if(data.last_thread != last_state.last_thread || data.last_response != last_state.last_response || data.last_tvote != last_state.last_tvote || data.last_rvote != last_state.last_rvote){
					loadThread('big', 'dummy');	 
				} 
				//update user_view with scroll --- responses
				if(data.my_last_thread_responses != last_state.my_last_thread_responses){
					reload($(".user-view").scrollTop(), true);
				}
				//update user_view without scroll --- votes
				if(data.my_last_thread_tvote != last_state.my_last_thread_tvote || data.my_last_thread_rvote != last_state.my_last_thread_rvote){
					reload($(".user-view").scrollTop(), false);
				}
				////update user clock
				 currThreadTime(data.timediff)
				
				
				//store in localStorage
				localStorage.setItem('curr_page_state', JSON.stringify(data));
 			}
 		});
 		 setTimeout(updatePage, 10000);
 	}/////end updatePage
 	

    // add new thread
	
	
	function addPost(){
		//console.log($("#id_title").val(), $("#id_text").val(), $("#id_is_thread").val())
		post_text = $("#id_text").val()
		if(post_text.length < 32){
			post_title = post_text
		}else{
			post_title = post_text.slice(0,32) + "..."
		}

// 		console.log({ "title": post_title, post_text, "is_thread": $("#id_is_thread").val() })
		$.ajax({
			type: "POST",
			url: "/ajax/add/",
			dataType: "json",
			data: { "title": post_title, "text": post_text, "is_thread": $("#id_is_thread").val() },
			success: function(data) {
				//reload the user view
				reload($(".user-view").scrollTop(), true);
				
				///clear textarea
				$("#id_text").val('')
				$("#char-count").html(142)
				
				////check if thread is visible and check what the local storage is
				check_handle = $('#'+localStorage.getItem('open_thread')).parent().parent().next().children('div:first-child').html()
				
				// check if open local storage for open thread  DONT NEED ANYMORE JUST EXCLUDED CURRENT THREAD IN DJANGO VIEWS
// 				if (parseInt(localStorage.getItem('open_thread').split("_")[2]) == $('.user-box-container').data('thread') && check_handle != undefined){
// 					refreshOpenThread();
// 				}
				
			}
		});
	
	}
	
	$('.post-btn').click(function(){
		addPost()
	});////end of POST
	
	$("#id_text").keydown(function(e){
		if(e.keyCode == '13' )
		{
			addPost()
		}
	});
	
	
////////function that refreshes the main open thread	
function refreshOpenThread(){
	handle = $('#'+localStorage.getItem('open_thread')).parent().parent().next().children('div:first-child')
 	$.ajax({
		type: "GET",
		url: localStorage.getItem('open_thread').replace(/_/g,'/'),
		success: function(data) {
			//////add content
			handle.html(data); 
			////////attach vote/delete
			attach_details(handle);
			/////////scroll to the bottom of div
			myScroller(handle.children('.response-container'), handle.children('.response-container').prop('scrollHeight')-564)
			 
			}
	});
	
			
}  

//////////function that re-attaches voting and deleting of threads
 function attach_details(handle){
 
 //console.log(handle)
		///make sure vote is represented visually for each response 
		handle.find(".vote-list-response").each(function( index ) {
				$(this).find('#'+$(this).data("bind")).children("div:first").css({background:'#f28c8c'})
		});
	
	
		//////attach click to each response for voting option
		handle.find(".vote-list-response li").click(function(){
	
			option_data = $(this).data("vote")
			post_data = $(this).parent().data("post")
			curr_vote = $(this).parent().data("bind")
			vote_type = $(this).parent().data("type")
			this_inside = $(this)
			obj = [{"post": post_data, "option": option_data, "post_type": vote_type }, this_inside, curr_vote]
			//console.log(obj)
			///////
			if(option_data == "TR" && curr_vote != "TR"){
				message = "Three troll votes and this comment is deleted. Sure you want to mark this comment Troll?"
				if(myAlert('confirm', message, obj, vote)){
					alert('this returned true!!')
				}
		
			}else{
				vote(obj)
			}

		});////end of .vote-list-response li Click
	
	
		////////attach delete response click
		handle.find(".respo-vote-left").click(function(){
		
			curr = $(this);
			message = "Are you sure you want to delete this post?";
			myAlert('confirm', message, curr, deletePost);
			
		});////end of Click
	}//////end of attach_details   
    //add new response


    // CSRF code
    function getCookie(name) {
        var cookieValue = null;
        var i = 0;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (i; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    }); 


	
 ///////////set the sorter functions ADD EVALUATE LOCAL STORAGE AND STYLE THE BUTTONS TO BE ON WHEN ON!!  
 	 $('.sorter div').each(function(){
			var this_div = $(this);
			
			if(!$.isEmptyObject(this_div.data())){
				$.each(this_div.data(), function(key, value) {
				
					//console.log(this_div.data())
					if(localStorage.getItem(key) == value){
						this_div.css({background: 'rgb(251, 249, 234)', 'border-bottom':'1px solid #e6e6e6'});
						this_div.children('span').first().css({width:"22px"});
						
					}//dope green blue rgb(239, 243, 242)224, 229, 235
				});
			}
    	});


    $('.sorter .sort, .sorter .keyword').on(' click',function(){
    	var this_div = $(this);
		$(".center")[0].style.opacity = 0;
    	if(!$.isEmptyObject(this_div.data())){
			$.each(this_div.data(), function(key, value) {
			
				if(this_div.attr('rel')){
					localStorage.setItem(this_div.attr('rel'),"");
				}
				
				if(localStorage.getItem(key) == value){
					localStorage.setItem(key,"");
					loadThread(key, "");
					this_div.css({background:'rgb(252,252,252)','border-bottom':'1px solid transparent', left:"0"});
					this_div.children('span').first().css({width:""})
					
				}else{
					localStorage.setItem(key,value);
					loadThread(key, value);
				
					if(key == "contains" || key == "pub" || key == "pop"){
						this_div.parent().children().css({background:'rgb(252,252,252)','border-bottom':'1px solid transparent', left:"0"});
						this_div.parent().children('div').children('.sort-arrow').css({width:""})
						// this_div.parent().children('div').attr('class','sort')

					}
					this_div.css({background: 'rgb(251, 249, 234)','border-bottom':'1px solid #e6e6e6'});
					this_div.children('span').first().css({width:"22px"});
					
					// this_div.attr('class','sort sort-selected')
// 						this_div.children().first().attr('class','sort-arrow sort-arrow-on')
				
				
			
				}
			});
		}
		//if mobile version, hide sorter panel
		// if($('.sorter').css("z-index") == '6'){
// 			$('.sorter').css({right:'-100%'})	
// 		}
		
    });
    
    /////////scroll to top when you get too far down
    $('.scroll-to-top').click(function(){
		myScroller($(".main-feed"), $(".main-feed").offset().top);
	});	
	
	/////////search threads
	$('#search-threads').click(function(){
		loadThread('contains', $(this).prev().val());
		//alert($(this).prev().val())
	})
 

//////////doing this with python on load, k.i.s.s.
// 	function smallPies(){
// 		$( "circle.small-pie" ).each(function(){
// 			off = $(this).data('sda')/10000;
// 			off = off.toString();
// 			off = off + ", 49.9"
// 			//$(this).css({strokeDasharray:off});
// 			// $(this).animate({strokeDasharray:off}, 800, function(){
// // 				console.log(off)
// // 			});
// 			//$(this).css({strokeDasharray: off, transition: "stroke-dasharray", transitionTimingFunction:'ease', transitionDuration: '20s' });
// 
// 		
// 		});
// 	
// 	
// 	}



	function loadSideBar(){
		$.ajax({
            type: "GET",
            url: "/time_since/",
            success: function(data) {
            	$("#keywords").html(data)
            	//currThreadTime(data.slice(16, 19).replace('<','').replace('/',''));

	
        	}
        });
	}

	
	
///// scroll to see pie timer when you focus on post form
	(function tinyScroll() {
		$('#id_text').on('focus', function() {	
			
			/////scroll user view to bottom of texts
			var scroll_diff = $(".user-box-container").height() - $(".user-view").height();
			
			myScroller($(".user-view"), scroll_diff);
			
			// $("header").css({height:0})
// 			$(".content-wrap").css({height:"calc(100vh - 36px)"})
			

		}).on('blur', function() {
			
			// $("header").css({height:$("header>div").css("height")})
// 			$(".content-wrap").css({height:"calc(100vh - 126px)"})
		
		});
	})();
	
	
	///////blocks weirrd jitter on manual scroll
	function myScroller(element, position){
		page = $("html, body");

	   page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
		   element.stop();
	   });

	   element.animate({ scrollTop: position }, 2000, 'easeOutQuint', function(){
		   element.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
	   });

	   return false; 
	
	}	

////////start pie timer
	function currThreadTime(startTime) {
		var time = parseFloat(startTime, 10);
		 var hrs = 24 - (time/49.9 * 24)
		 var minutes = (hrs % 1) * 60
		 	 hrs = Math.floor(hrs)
		     minutes = Math.floor(minutes)
		     
		//console.log("hrs, min: ", hrs , minutes)
		if(time < 49.9){
			var off_set = (time / 49.9) * 106.2;
			off_set = off_set.toString() + ' 106.2';
			var cssTime = 86400 - time
			cssTime = cssTime + "s"
// 			stroke: '#ff668c', , stroke: '#f28c8c'
			$( "circle.pie" ).css({strokeDasharray: off_set, transition: "stroke-dasharray", transitionTimingFunction:'ease', transitionDuration: '1s' });
	
			$( "circle.pie" ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				$( "circle.pie" ).css({strokeDasharray: '106.2 106.2', transition: "all", transitionTimingFunction:'linear', transitionDuration: cssTime });
			});
			
			$("#time-text").html(hrs+" hrs & "+minutes+" min remaining")
	
		}else{
	
			$( "circle.pie" ).css({strokeDasharray: '106.2 106.2', transition: "all", transitionTimingFunction:'ease', transitionDuration: '2s' });
			$( "circle.pie" ).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				$( "circle.pie" ).css({transition: "none !important"});
		
			});
		}
	
		
	}/////end of pie timer	
	
	/////////pop up window for status and notifications
	$('#fixed-top-left>ul>li').on('click', function(){
		
		var this_li = $(this);
		var type = $(this).data('type');
		
		if($('#pop-up-wrapper').length && $('#pop-up-wrapper').data('type') == type){
		
			$('#pop-up-wrapper').remove()

		}else{
			
			if(this_li.data('hold') == "off"){
				
				this_li.data('hold', 'on');
				
				$('#pop-up-wrapper').remove()
				$.ajax({
					type: "GET",
					url: "/"+type+"/",
					success: function(data) {
				
						this_li.data('hold', 'off');
						//console.log($(this).data('hold'));
						myPopUp(data, type);
					
						$('body').on('click', function removePop(e){
							e.stopPropagation()
							
							if ( e.toElement.id == "pop-up-wrapper" || e.toElement.id == "pop-up" || e.toElement.parentNode.id == "pop-up-wrapper" || e.toElement.parentNode.id == "pop-up4") 
							{
								return false;
							}else{
								$('#pop-up-wrapper').remove();
								$('body').off('click',removePop);
							
							}
						});
					}
				});
			}
		}	
		
	});
	
	function myPopUp(data, type) {
		
		var popUpWrapper = document.createElement("div");
		var popUpDiv = document.createElement("div");
		
		popUpDiv.innerHTML = data
	
		popUpWrapper.setAttribute("id", "pop-up-wrapper" );
		popUpWrapper.setAttribute("data-type", type );
		popUpDiv.setAttribute("id", "pop-up" );
	
		///////append all else
			
		popUpWrapper.appendChild(popUpDiv);
		document.body.appendChild(popUpWrapper);

		popUpWrapper.style.opacity = 0;
		popUpDiv.style.opacity = 0;
		popUpWrapper.style.left = "-40px";
		popUpDiv.style.left = "-40px";
	
		setTimeout(function () {
			popUpWrapper.style.opacity = 1;
			popUpDiv.style.opacity = 1;
			popUpWrapper.style.left = "25px";
			popUpDiv.style.left = "25px";
		}, 30);
		
		
	
	}
	
	function myAlert(type, message, el, func) {
	
		var alertDivWrapper = document.createElement("div");
		var alertDiv = document.createElement("div");
		var div = document.createElement("div");
		
		alertDivWrapper.style.opacity = 0;
		alertDiv.style.opacity = 0;
		alertDiv.style.top = 0;
		
		//////transition magic
		setTimeout(function () {
		  	alertDivWrapper.style.opacity = 1;
			alertDiv.style.opacity = 1;
			alertDiv.style.top = '100px';
		}, 0);
		
		var okBtn = document.createElement("input");
		okBtn.setAttribute("type", "submit" );
		okBtn.setAttribute("value", "yes" );
		okBtn.setAttribute("id", "yes" );
		
		/////append message & okbtn
		div.innerHTML = '<p>' + message + '</p>';
		
		
		///////on
		if(type == "confirm"){
			var notOkBtn = document.createElement("input");
			notOkBtn.setAttribute("type", "submit" );
			notOkBtn.setAttribute("value", "no" );
			notOkBtn.setAttribute("id", "no" );
			
			/////append notOkBtn
			div.appendChild(notOkBtn);
		}
		
		div.appendChild(okBtn);
		
		alertDivWrapper.setAttribute("class", "my-alert-wrapper" );
		alertDiv.setAttribute("class", "my-alert" );
		
		///////append all else
		alertDiv.appendChild(div);
		alertDivWrapper.appendChild(alertDiv);
    	document.body.appendChild(alertDivWrapper);
    	
    	
    	$('#yes').click(function(){
    		func(el);
    		$(this).parent().parent().parent().remove()
    		return true;
    	});
    	
    	$('#no').click(function(){
    		$(this).parent().parent().parent().remove()
    		return false;
    	});
    	
    	$('.my-alert-wrapper').click(function(){
    		$(this).remove()
    		return false;
    	});
    	
	}
	
	
	///////////////functions here for myAlert (confirm style)
	
	/////////delete posts although just works for responses right now
	function deletePost(el){
		pk = el.data("post")
		container = el.parent().parent();
		$.ajax({
				type: "POST",
				url: "/delete_post/",
				data: {"pk": pk, "post_type": "response" },
				success: function(response) {
					container.css({opacity:0, transition: "all", transitionTimingFunction:'ease', transitionDuration: '0.6s' });
					container.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
						container.remove();
					});
	
				}
		});
	}//////end of deletePost
	
	
	
	/////////delete posts although just works for responses right now
	function showResponses(this_thread, data){
		
		var thread_wrapper = document.createElement("div");
		var thread_div = document.createElement("div");
		var details_div = document.createElement("div");
		
		///get position of thread you are clicking on
		this_thread_position = this_thread.offset().top - $(window).scrollTop() +"px"
		
		thread_wrapper.style.opacity = 0;
		thread_wrapper.id = "thread-wrapper-pop";
		
		thread_div.style.top = this_thread_position;
		thread_div.id = "thread-div-pop";
		thread_div.style.height = "612px";
		thread_div.innerHTML = "<div class="+this_thread.attr('class')+">"+this_thread.html()+"</div>";
		
		details_div.innerHTML = data;
		
		//////transition magic
		setTimeout(function () {
		  	thread_wrapper.style.opacity = 1;
			thread_div.style.top = "34px";
			thread_div.style.height = "calc(100vh - 34px)";
			
		}, 0);
		
		///////append all else
		thread_div.appendChild(details_div);
		thread_wrapper.appendChild(thread_div);
    	document.body.appendChild(thread_wrapper);		
				
	}//////end of showResponses
	
	
		
	//////////voting for threads and responses
	function vote(obj){
	//console.log(this_inside)
		$.ajax({
			type: "POST",
			url: "/vote/",
			data: obj[0],
			success: function(post) {
				////reset vote on ul data tag, reset all backgrounds to grey
				obj[1].parent().data("bind", post.option);
				obj[1].parent().children('li').each(function(){
					 $(this).children("div:first").css({background:'#e6e6e6', color:'#b3b3b3'});
				});

				///check if post is deleted or not, style accordingly, set ul data tag to '' if deleted 
				if(post.deleted){
					obj[1].children("div:first").css({background:'#e6e6e6', color:'#b3b3b3'}); //rgba(247, 245, 237,0.96)
					obj[1].parent().data("bind", '');

				}else{
					obj[1].children("div:first").css({background:'#f28c8c', color:'#ffffff'});
				}

			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				console.log(XMLHttpRequest.responseText.slice(0,34));
				///////////this will return string 'IntegrityError' when the voter has voted for post already

			}
		});
	
	}//////////end of vote	
	
	
	///////limit characters that user can post
	function charCount(this_text){
		var count = 142 - this_text.val().length;
		
		if(count > 0){
		
			this_text.parent().next().html(count);
			this_text.parent().next().data("max_char", this_text.val());
			//console.log(this_text.parent().next().data("max_char"))
		}else{
		
			this_text.parent().next().html("<span style='color:red;'>0</span>");
			this_text.val(this_text.parent().next().data("max_char"));	
		}
	
	}
	
	////////limit characters that you can post to 142
	$("#id_text").on("keyup", function(){
		charCount($(this));	
	});
	
	
	
	/////////Pretty Lights!!!
	(function prettyTitle() {
		$( "header span, .post-user p span").each(function(i, el){
			var theSpan = $(this);
			setTimeout(function(){
		   	if(theSpan.parent().prop("tagName") == "P"){
// 		   		response titles
				var red = "#fffaf5"; ///actually yellow
				var salmon = "#ffd9cc";
			}else{
// 				main title
				var red ="#fef8cd";//#ef7578
				var salmon = "#ffbaa2";
				
			}	theSpan.css({color: salmon, transition: "all", transitionTimingFunction:'ease', transitionDuration: '6s' });
				theSpan.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					theSpan.css({color: red, transition: "all", transitionTimingFunction:'ease', transitionDuration: '6s' });
					theSpan.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
						theSpan.css({color: '#ffffff', transition: "all", transitionTimingFunction:'ease', transitionDuration: '6s' });
					});
				});
		
			},100 + ( i * 500 ));
		});
    	setTimeout(prettyTitle, 25000);
	})();////////////end of PrettyLights
	
	
	////toggle user-view and main-feed
	$("header>div>div").on("click", function(){
		
		if($(".left-wrap").css("left") == "0px"){
			$(".left-wrap").css({left:"-100%"})
			$("#fixed-top-right ul li:nth-child(2)").css({width:"34px"});
			$("header>div>div").attr('id','compose-ico')
			$('.scroll-to-top').css({display:"block"})
			// $('.main-feed').removeAttr('style');
//         	$('.user-view').removeAttr('style');
			
			
		}else{
			$(".left-wrap").css({left:"0"})
			$("#fixed-top-right ul li:nth-child(2)").css({width:"0px"});
			$("header>div>div").attr('id','posts-ico')
			$('.scroll-to-top').css({display:"none"})
			// $('.main-feed').removeAttr('style');
//         	$('.user-view').removeAttr('style');
			//$(window).scrollTop( 90);
			//myScroller($(window), -90)
		}
	
	})
	
	////toggle sorter menu
	function toggleSorter(){
		var sorter_wrap =  $(".center").width()
			sorter_wrap = sorter_wrap+"px"
			//console.log(sorter_wrap)
			
		var sorter_div_right =  $(".center").width() * 0.4
			sorter_div_right = sorter_div_right+"px"
	
		if($(".sorter>div").css("right") == "0px"){
			$(".sorter").css({opacity:"0"});
			setTimeout(function(){
				$(".sorter").css({right:"-"+sorter_wrap, width:sorter_wrap});
			}, 700);
			$(".sorter>div").css({right:"-"+sorter_div_right});
			
		}else{
			$(".sorter").css({right:"0px", width:sorter_wrap, opacity:"1"});
			$(".sorter>div").css({right:"0px", width:sorter_div_right});
		}
	}
	
	////
	$("#fixed-top-right>ul>li:nth-child(2)").on("click", function(){
		toggleSorter();	
	});
	
	
	function closeThread(){
		var thread_id = localStorage.getItem('open_thread');
		var this_thread_position = ($("#" + thread_id).offset().top - $(window).scrollTop()) +"px";
		var center_check = parseInt($(".center").css("width").replace("px", "")) / $(window).width();
		
		$("#thread-wrapper-pop").css({opacity:0});
		
		if(center_check == 1){
		
			$("#thread-div-pop").css({width:"100%", left:"0", height:"168px",top:this_thread_position});
			
		}else if(center_check < 1 && center_check > 0.5){	
		
			$("#thread-div-pop").css({width:"68%", left:"42%", height:"168px",top:this_thread_position});
			
		}else{
			$("#thread-div-pop").css({width:"45%", left:"33%", height:"168px",top:this_thread_position});
		}
		$("#thread-div-pop").find(".details").css({height:"0px"});
		$("#thread-div-pop").find(".white-space").css({height:"0px"});
		$("#close-btn").css({opacity:0})
		setTimeout(function(){
			$("#thread-wrapper-pop").css({display:"none"});
			$("#thread-div-pop").css({display:"none"});
			$("#thread-wrapper-pop").css({opacity:1});							
			
		}, 500);
	
	}
	
	///////close with
	$("#thread-wrapper-pop").on("click",function(){
		closeThread();
	});
	
	////close thread on scroll
	// function closeThreadScroll(){
// 		var thread_id = localStorage.getItem('open_thread');
// 		var position_stamp = $(window).scrollTop(); 
// 		
// 		$(document).on("scroll", function(e){
// 			var position = $(window).scrollTop();
// 			console.log(position, position_stamp);
// 			if (position >= position_stamp + 300 || position <= position_stamp - 300) {
// 				closeThread();
// 				$(document).off("scroll");
// 			}
// 		});
// 	};
	
	//if(typeof window.orientation !== 'undefined'){
    /* cache dom references */ 
    //var $body = jQuery('body'); 


	//////fix for #fixed-side & .post-form-container on resize of screen so either div is not ever hidden from view
	$(window).resize(function(){
		//$("#inner-height").html($(window).innerHeight())
		
		
		
		var center_check = parseInt($(".center").css("width").replace("px", "")) / $(window).width();
		///phone
		if(center_check == 1){
			// if($(".content-wrap").css("left") == "0px"){
// 				$(".content-wrap").css({left:"0",height:""})
// 			}else{
// 				$(".content-wrap").css({left:"-100%",height:""})
// 			}
			$(".content-wrap").removeAttr("style")
			$("#fixed-top-right ul li:nth-child(2)").css({width:"0px"});
			$(".sorter").removeAttr("style")
			$(".sorter>div").removeAttr("style")
			$(".user-view").removeAttr("style")


		///tablet	
		}else if(center_check < 1 && center_check > 0.5){
			$(".left-wrap").removeAttr("style")//.css({left:"0"})
			
			$("#fixed-top-right ul li:nth-child(2)").css({width:"34px"});
			$(".sorter").removeAttr("style")
			$(".sorter>div").removeAttr("style")
			$(".user-view").removeAttr("style")
			$(".user-view").off('scroll')
			$(".main-feed").off('scroll')
			$("header").removeAttr("style")
		
		///desktop	
		}else{
			$(".left-wrap").removeAttr("style")//.css({left:"0"})
			if($("#fixed-top-right ul li:nth-child(2)").css('width') == "34px"){
				$("#fixed-top-right ul li:nth-child(2)").css({width:"34px"});
			}else{
				$("#fixed-top-right ul li:nth-child(2)").css({width:"0px"});
			}
			$(".sorter").removeAttr("style")
			$(".sorter>div").removeAttr("style")
			$(".user-view").removeAttr("style")
			$(".user-view").off('scroll')
			$(".main-feed").off('scroll')
			$("header").removeAttr("style")
			
		
		}
		
	});
	
	
	////////when all is loaded, updatePage
	updatePage();
	
	////dealing with iphone bars
	//$(window).scrollTop("44px")
	//$(".content-wrap").css({height:($(".content-wrap").height() + 44) + "px"});
	
	
	
});//////endtag
