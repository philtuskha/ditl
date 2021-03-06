$(document).ready(function() {

	var OneThread = (function(){
		var store_scroll_top = 0
		var _transitionPopUp = function(handle){
	
			// use instead of settimeout to make magic transition happen
			// window.getComputedStyle($(this)[0]);
			
			
			//transition magic
			setTimeout(function () {
				var center_check = $(".center").width() / $(window).width();

				$("#thread-wrapper-pop").css({opacity:1});
			
				var pop_style = (center_check == 1) ? ["100%", "0"] : (center_check < 1 && center_check > 0.5) ? ["70%", "30%"] : ["47%", "32%"]
			
				$("#thread-div-pop").css({display:"block", top:"0", width:pop_style[0], left:pop_style[1], height:$(window).innerHeight()});  //$("#viewport").height()+'px'
				
				if(center_check == 1 && 'ontouchstart' in document.documentElement){
					store_scroll_top = $(document).scrollTop()
					$('.content-wrap').css({"min-height":"0px", height:"0px"})
					$('#thread-div-pop').css({overflow:"auto"})
				}
				
				//var window_height = $(window).innerHeight() - ($("#thread-div-pop").children().first().height() + $("#thread-div-pop").children().first().next().height() - 36)

				// handle.parent().css({height:window_height+"px"});
// 				handle.css({height:window_height+"px"});
				handle.parent().css({top:"91px", bottom:"0px"});
				handle.css({top:"0px", bottom:"0px"});
				
				$("#thread-div-pop .expand-right>li:nth-child(1)").css({height:"0px", "margin-bottom":"8px"})
				$("#thread-div-pop .expand-right>li:nth-child(2)").css({"text-align":"right"})
				$("#thread-div-pop .expand-left").css({width:"124px"})
				$("#thread-div-pop .expand-left>li:nth-child(2)").css({width:"78px","padding-top":"6px"})
				$("#thread-div-pop .expand-right").css({width:"calc(100% - 148px)"})
				$("#thread-div-pop .expand").css({padding:"8px 0 0 8px"})
				
			}, 30);
		
		}
		var _addToStorage = function(curr_id, handle){
		
			////////add thread to localStorage if open
				if(handle.html() != "" ){
					localStorage.setItem('open_thread', curr_id);
				}else{
					localStorage.setItem('open_thread', '');
				}
		}
	
		var _bindThreadEvents = function(handle){
		
			var center_check = $(".center").width() / $(window).width();
			
			///////scroll to the bottom response on click
			$("#id_text_r").on("click", function(){
				Scroller.myScroller(handle.children().first(), handle.children().first().prop('scrollHeight') - handle.height())
			});
			
			if(center_check == 1 && 'ontouchstart' in document.documentElement){
				$("#id_text_r").on('focus', function(){
				
					$('.content-wrap').css({"min-height":"0px", height:"0px"})
					$('#thread-div-pop').css({overflow:"auto"})
					$('body, html').css({background:"#f8f8f8"});
				
				}).on('blur', function(){
					//$('#thread-div-pop').css({bottom:""}) //top:"0px"
					//$('#thread-wrapper-pop').css({background:"rgba(0,0,0,0.1)", height:"100vh"});
					// $('#thread-div-pop').css({overflow:""})
					$('body, html').css({background:"#404040"});
				});
				
				///fix mobile when popup when orientation changes
				$(window).on("orientationchange", function(){
					if($("#thread-div-pop").css('display') == 'block'){
						setTimeout(function(){
							$("#thread-div-pop").css({height:$(window).innerHeight()});
							$('.content-wrap').css({"min-height":"0px", height:"0px"})
						}, 300);
					}
					
				});
			}
			
			////attach character counter
			Character.bindCharCount($("#id_text_r"))
		}
		
		// var _stopMainScroll = function() {
// 			$('#thread-div-pop').find('.details').on('scroll', function(e){
// 				e.stopPropagation();
// 			});
// 		}
		
		var loadCurrThread = function(curr_id, handle, reload){
			var curr_url = "/thread/"+curr_id+"/",
				curr_position = handle.children().first().scrollTop(),
				center_check = $(".center").width() / $(window).width();
	
			$.ajax({
			type: "GET",
			url: curr_url,
			success: function(data) {
		
					//showResponses(thread,data)
					handle.html(data);
			
					
					///like it says
					 _transitionPopUp(handle);
			 
					//call the function attach_details function, change this eventually 
					AttachVoteDelete.run(handle);
			
					//add current thread to storage (what is this for?, again)
					_addToStorage(curr_id, handle)
			
					/////attach restore click event to deleted (hidden) threads 	
					RestorePost.bind(handle);
			
					_bindThreadEvents(handle)
					
					///attach AddPost functionality
					AddPost.bindAddPost($("#id_text_r"))
					
					///prevent body from scrolling 
					//_stopMainScroll()
					
					///convert to localtime
					UTC2Local.convert(handle)
					
					/////bind swipe to responses
					if('ontouchstart' in document.documentElement){
						SwipeBubble.bind()
					}
					
					handle.children().first().scrollTop(curr_position)
					
					if(reload){
						
						setTimeout(function(){
							Scroller.myScroller(handle.children().first(), handle.children().first().prop('scrollHeight') - handle.height())
								
						}, 30)
						
					
					}
					// 
// 					$('#thread-div-pop').find('.response-container').on('scroll', function(){
// 						console.log($(this).scrollTop(), $(this).offset().top )
// 					});
				
				},
			error: function(){
				AjaxError.show();
			}
			})
		}
		
		var _closeThread = function(){
			var thread_id = $('#thread-div-pop').find(".post-user").data("thread"),
				this_thread_position = ($("#" + thread_id).offset().top - $(window).scrollTop()) +"px",
				this_thread_height = $("#" + thread_id).height() + 'px',
				center_check = $(".center").width() / $(window).width(),
				wrapper = $("#thread-wrapper-pop"),
				div = $("#thread-div-pop");
			
			$("#thread-wrapper-pop").css({opacity:0});
			
			///hacky mobile fixes
			if(center_check == 1 && 'ontouchstart' in document.documentElement){
				$('.content-wrap').removeAttr('style')
				$(document).scrollTop(store_scroll_top)
				this_thread_position = ($("#" + thread_id).offset().top - $(window).scrollTop()) +"px"
			}
			
			if(center_check == 1){
		
				div.css({width:"100%", left:"0", height:this_thread_height, top:this_thread_position});
			
			}else if(center_check < 1 && center_check > 0.5){	
		
				div.css({width:"68%", left:"42%", height:this_thread_height, top:this_thread_position});
			
			}else{
				div.css({width:"45%", left:"33%", height:this_thread_height, top:this_thread_position});
			}
			
			div.find(".details").css({height:"0px"});
			div.find(".white-space").css({height:"0px"});
			$("#close-btn").css({opacity:0})
			
			$("#thread-div-pop .expand-right>li:nth-child(1)").removeAttr('style')
			$("#thread-div-pop .expand-left").removeAttr('style')
			$("#thread-div-pop .expand-left>li:nth-child(2)").removeAttr('style')
			$("#thread-div-pop .expand-right").removeAttr('style')
			$("#thread-div-pop .expand").removeAttr('style')
		
			setTimeout(function(){
				wrapper.css({display:"none"});
				div.css({display:"none"});
				wrapper.css({opacity:1});								
			
			}, 500);
		}
		
		var _bindClose = function(){
			$(".close-btn").on("click",function(){
				/////change this function eventually
				_closeThread();
			});
			
			$("#thread-wrapper-pop").on("click",function(){
				_closeThread();
			});
		}
	
		var openPopUp = function(curr_el){
			var thread_div_pop = $("#thread-div-pop");

			thread_div_pop.html(curr_el.html());
			//setup
		
			///////add close button to top of open thread
			thread_div_pop.children(".post-user").append("<span class='close-btn'></span>")
		
			_bindClose()
		
			//remove triange from responses class
			thread_div_pop.find(".rotate-arrow").remove()
		
			//var handle = $("#thread-div-pop").find(".details")
			var handle = thread_div_pop.find(".details")
		
			///get position of thread you are clicking on
			var this_thread_position = curr_el.offset().top - $(window).scrollTop() +"px"
		
			//display pop up
			$("#thread-wrapper-pop").css({display:"block"});
			thread_div_pop.css({display:"block", top:this_thread_position, height:curr_el.height()+"px"});
		
			//////
			loadCurrThread(curr_el.attr("id"), handle, false)
		
		}
	
		return{
			openPopUp: openPopUp,
			loadCurrThread: loadCurrThread
		}
	
	})();
	
	
	var AllThreads = (function(){
	
		var _getLocalStorage = function(){
		
			var pData = {}, //start object
				filter_text = "",
				order_text = "",
				filter = $("#filter"),
				order = $("#order");
				// sticky_filter = $("#sticky-filter"),
// 				sticky_order = $("#sticky-order");

			for (var i = 0; i < localStorage.length; i++){
				var key = localStorage.key(i);
				
				if(key != "curr_page_state"){
				
					var value = localStorage.getItem(key),
						filter_options = {
							my: "<div id='my'>my convos<div class='close-filter'></div></div>",
							faves: "<div id='faves'>favorite users<div class='close-filter'></div></div>",
							contains: '<div id="contains">"'+value+'"<div class="close-filter"></div></div>'
						},
						order_options = {
							pop: "<div id='pop'>most popular <div class='close-filter'></div>",
							pub: "<div id='pub'>ending soon <div class='close-filter'></div>"
						};
				
					if (value !== "" && value !== null){
						pData[key] = value; //add to object
						//console.log("key: ",key,"value: ",value)
						order_text += (key == "pop") ? order_options.pop : (key == "pub") ? order_options.pub : "";
						filter_text += (key == "my") ? filter_options.my : (key == "faves") ? filter_options.faves : (key == "contains") ? filter_options.contains : ""
				
					}	
				}	
			}
			
			order.html(order_text)
			filter.html(filter_text)
		
			return pData
		}
		
	
		var _closeFilter = function(element){
			var blank = "",
				el_parent_id = element.parent().attr('id');
			
			///remove from storage	
			localStorage.setItem(el_parent_id, blank);
		
			///load the whole 
			AllThreads.load(el_parent_id, blank);
		
			///style sorter assosiated with this, change this to remove attribute 
			$(".sorter").find("[data-"+el_parent_id+"]").css({background:'transparent'});
			
			if(el_parent_id == "contains"){
				$("#search-text").attr("placeholder","Search")
			}
		
			//console.log($(".sorter").find("[data-"+el_parent_id+"]"))
		}
	
		var _bindFilterClose = function(){
			$(".close-filter").on("click", function(){
				_closeFilter($(this))
			});
		
		}
	
		var _addCurrKeyValue = function(pData, pKey, pValue){
			if (pValue != ""){
				pData[pKey] = pValue;
			}
			return pData
		} 
	
	
		var _bindEachThread = function(){
			$('.main-feed').children().last().find(".thread").on("click",function(){
				////attach to each Thread 
				OneThread.openPopUp($(this))
			});
		}
		
		var showScrollToTop = function(el){
			///center_check
			var center_check = $(".center").width() / $(window).width();
			
			var _show = function(){
				if(el.scrollTop()  > $(window).height()){
					$('.scroll-to-top').css({transition : 'all 0.5s ease-in-out', opacity:1, height:'50px'});
				}else{
					$('.scroll-to-top').css({transition : 'all 0.5s ease-in-out', opacity:0, height:'0px'});
				}
			}
			
			///determine phone or tablet/laptop
			if(center_check == 1){
				if($('.left-wrap').css('left') != "0px"){
					_show();
				}
			}else{
				_show();
			}
		}
		
		var loadThreadsOnScroll = function(el){
			x = $('.main-feed').children().length * 10
			y = x + 10

			x = x.toString();
			y = y.toString();

			load('start_end',x+','+y);
			
		}
		
		
		var _checkThreadsOnScroll = function(el, scroll_diff){
			//console.log($(this).scrollTop(), e, e.scrollHeight, $(this).children().last().height() - $(this).height())
			var total_height = 0;
			$('.main-feed').children().each(function(){
				total_height = total_height + $(this).outerHeight(true);
			});
			
			 if(el.scrollTop() > total_height - el.height() - 200 && scroll_diff < 0){
				if(el.children().last().height() > 0){
					
					$(el).off('scroll.loadMore', loadThreadsOnScroll(el))

				}
				
			}
		}
		
		var _bindScroll = function(){
			last_scroll = 0
			$('.main-feed').on('scroll.loadMore', function(){
				this_scroll = $(this).scrollTop()
				scroll_diff = last_scroll - this_scroll
		
				_checkThreadsOnScroll($(this), scroll_diff)
				showScrollToTop($(this))
				
				last_scroll = this_scroll
			});
		
		}

		var _styleAfterSucess = function(){
			////remove
			$("#id_title").val("")
			$("#id_text").val("")
		
		
			window.getComputedStyle($(".main-feed")[0]);
			$(".main-feed")[0].style.opacity = 1;
			
		}
		var _cloneDropTop = function(){
			//if($('.left-wrap').css("left") != "0px"){
				var drop_clone = $('#drop-top').clone(true)
				$(".sticky-drop-top").html(drop_clone)
			//}
		}
		
		var _loadResponse = function(pData , pKey, pValue){
			$.ajax({
				type: "GET",
				url: "/thread_list",
				data: pData,
				success: function(data) {
					//console.log("data length: ", data.length)
					var main_feed = $(".main-feed");
				
					if(pKey == "start_end" ){
						main_feed.append('<div id="'+pValue+'">' + data + '</div>')
					
					}else{
						if(data.length > 31 ){
							main_feed.html('<div id="0,10">' + data + '</div>')
						}else if(data.length == 31){
							main_feed.html('<div id="no-results"><h1>SORRY, NO POSTS MATCH YOUR QUERY :(</h1></div>')
						}else{
							//do nothing. this is for when no user is logged in
						}
					
					}
				
					///like it says  
					_styleAfterSucess()
				
		
					//bind each thread to click that opens up that thread
					_bindEachThread()
					
					//after thread is loaded only
					_bindScroll()
					
					//cloning droptop and appending to sticky-top
					_cloneDropTop()
					
					UTC2Local.convert(main_feed)
				},
				error: function(){
				AjaxError.show();
				}
			});
		}
		
		
		var load = function(pKey, pValue){
			/////get Localstorage, find what parameters are already set
			localData = _getLocalStorage()
		
			///bind filter closing functionality
			_bindFilterClose()
		
			/////add current parameters to parameter object
			pData = _addCurrKeyValue(localData, pKey, pValue)
		
			_loadResponse(pData, pKey, pValue)
			
		
		}
		
		var init = function(){
			localStorage.setItem("contains", "")
			load("_", "_")
		}
		
		init()
		
		return{
			load: load,
			loadThreadsOnScroll: loadThreadsOnScroll,
			showScrollToTop: showScrollToTop
		}
	})();	


	var UserView = (function () {
		var _bindUVEvents = function(handle){
			///////scroll to the bottom response on click
			$("#id_text").on("click", function(){
				var scroll_diff = handle.children().last().height() - handle.height();
				Scroller.myScroller(handle, scroll_diff)
			}).on("focus", function(){
				$('body, html').css({background:"#f8f8f8"});
			
			}).on("blur", function(){
				$('body, html').css({background:"#404040"});
			
			});
		}
		var _cloneUserTop = function(){
			var user_top_clone = $(".user-top").clone(true);
			$('.sticky-user-top').html(user_top_clone);	
		}
		
		var _init = function(){
			var start_position = 0,
				start_scroll = false;
				
			load(start_position, start_scroll)
		}
			
		var load = function(curr_position, is_scroll){
			
			$.ajax({
			type: "GET",
			url: "/user_view/",
			success: function(data) {
				/////have to reference elements by name instead of assigning variables to get current state. better way?
					
				///load data into compartment
				$("#user").html(data)
				
				if(is_scroll){
				
					/////scroll user-view to look like texting
					$(".user-view").scrollTop(curr_position);
					setTimeout(function(){
						var center_check = $(".center").width() / $(window).width();
						if(center_check == 1){
							var scroll_diff = $(".user-view").height() - ($(window).height() - 240);
							Scroller.myScroller($("body, html"), scroll_diff);
						}else{
							var scroll_diff = $(".user-box-container").height() - $(".user-view").height();
							Scroller.myScroller($(".user-view"), scroll_diff);
						}        	
					},30);
					
				}else{
					$(".user-view").scrollTop(curr_position);
				}
			
				_bindUVEvents($(".user-view"))
				
				///get time since last post
				Timer.addTime($(".user-top>ul").data("timediff"));
				
				///attach voting options to comments
				AttachVoteDelete.run($('.user-box-container'));
				
				////attach restore option to deleted posts
				RestorePost.bind($(".user-view"));
				
				////adjust to local time
				UTC2Local.convert($(".user-view"))
				
				/////bind swipe to responses
				if('ontouchstart' in document.documentElement){
					SwipeBubble.bind()
				}
				
				_cloneUserTop();

				},
				error: function(){
				AjaxError.show();
				}
			});
		}
	
		_init()
		
		return{
			load: load
		}
		
	})(); 
	

 	var AddPost = (function(){
		
			var _currState = function(key_target){
				var text_id_check = (key_target.attr("id") == $("#id_text").attr("id"))
					curr_id = text_id_check ? $(".user-box-container").data("thread") : key_target.next().next().val(),
					post_text = key_target.val(),
					post_title = (key_target.val() < 32) ? key_target.val() : key_target.val().slice(0,32) + "...",
					post_type = text_id_check ? $("#id_is_thread").val() : $("#id_is_thread_r").val();
			
				return [curr_id, post_title, post_text, post_type];
			}
		
			var bindAddPost = function(key_target){
				key_target.parent().parent().find('button').on("click", function(){
					_loadAddPost(key_target)
				});
				
		
				key_target.on("keydown", function(e){
					if(e.keyCode == '13' ){	
						e.preventDefault();
						_loadAddPost(key_target)
						key_target.blur();
					}
				});
				
				/////add post on blur for mobile
				// if('ontouchstart' in document.documentElement){
// 					key_target.on('blur', function(){
// 						if(key_target.val() != ""){
// 							_loadAddPost(key_target)
// 						}
// 					})
// 				}
			};
			
			var _succesUserView = function(key_target){
			
				//reload the user view
				UserView.load($(".user-view").scrollTop(), true);
			
				///clear textarea
				key_target.val('')

				///reset character counter
				$("#char-count").html(142)
				
			};
			
			var _successThread = function(curr_id, handle){
				
				OneThread.loadCurrThread(curr_id, handle, true)
			
			}
			
			var _loadAddPost = function(key_target){
			
				var state = _currState(key_target),
				    handle = $("#thread-div-pop").find(".details"),
					curr_id = state[0],
					curr_container = key_target.parent().parent().prev(),
					curr_scroll_top = curr_container.scrollTop();
					
				//console.log(state)
				$.ajax({
					type: "POST",
					url: "/ajax/add/",
					dataType: "json",
					data: { "id": state[0], "title": state[1], "text": state[2], "is_thread": state[3] },
					success: function(data) {
						if(!data.troll){
							/////split these two options off into there own private funtions
							if(data.active == "True" && key_target.attr("id") == $("#id_text").attr("id")){
							
								_succesUserView(key_target);
							
						
							}else if(data.active == "True" && key_target.attr("id") != $("#id_text").attr("id")){
							
							
								_successThread(curr_id, handle);
							
							
							}
						}else{
							Alert.loadAlert(['alert', data.message])
						}
					},
					error: function(){
						AjaxError.show();
					}
				});
			};
		
			var _init = function(){
				var key_target = $("#id_text");
				
				bindAddPost(key_target);
			}
		
			_init();
			
			return {
				bindAddPost: bindAddPost
			}

	})();	


	var Vote = (function(){
		var _confirmedVote = function(obj, post){
			var bubble_middle = obj[1].parent().parent().parent();
		
			////reset vote on ul data tag, reset all backgrounds to grey
			obj[1].parent().data("bind", post.option);
			obj[1].parent().children('li').each(function(){
				 $(this).children("div:first").css({background:'#e6e6e6'});
				 
				 if($(this).children("div:first").children("span:first").hasClass('vote-heart-voted')){
				 	$(this).children("div:first").children("span:first").removeClass('vote-heart-voted');
				 }else if($(this).children("div:first").children("span:first").hasClass('vote-troll-voted')){
				 	$(this).children("div:first").children("span:first").removeClass('vote-troll-voted');
				 }
			});

			///check if post is deleted or not, style accordingly, set ul data tag to '' if deleted 
			if(post.num < 0){
				obj[1].children("div:first").css({background:'#e6e6e6'}); //rgba(247, 245, 237,0.96) |||  , color:'#b3b3b3'
				obj[1].parent().data("bind", '');
				
				///if touch
				if('ontouchstart' in document.documentElement){
					if(post.option == "SE"){
						bubble_middle.find('.touch-loved').remove()
					}else{
						bubble_middle.find('.touch-trolled').remove()
					}
				}

			}else{
				if(post.option == "SE"){
					obj[1].children("div:first").css({background:'#f28c8c'});
					obj[1].children("div:first").children("span:first").addClass('vote-heart-voted');
				}else{
					obj[1].children("div:first").css({background:'#666'});
					obj[1].children("div:first").children("span:first").addClass('vote-troll-voted');
				}
				
				///if touch
				if('ontouchstart' in document.documentElement){
					if(post.option == "SE"){
						bubble_middle.find('.touch-trolled').remove()
						bubble_middle.append('<div class="touch-loved"></div>')
					}else{
						bubble_middle.find('.touch-loved').remove()
						bubble_middle.append('<div class="touch-trolled"></div>')
					}
				}
			}
		}

		var makeVote = function(obj){

			$.ajax({
				type: "POST",
				url: "/vote/",
				data: obj[0],
				success: function(post) {
					if(!post.troll){
						if(post.th_check == "warning" && post.option == "TR" && post.num > 0){
							Alert.loadAlert(['alert', post.message])
							_confirmedVote(obj, post)
			
		
						}else if(post.th_check == "restricted" && post.option == "TR"  && post.num > 0){
							Alert.loadAlert(['alert', post.message])
		
						}else{
							_confirmedVote(obj, post)
						}
					}else{
						Alert.loadAlert(['alert', post.message])
					}
		
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					AjaxError.show();

				}
			});
		}

		return{
			makeVote: makeVote
		}

	})();
	
	
	var SwipeBubble = (function(){
		var bkg_opacity = 0,
			origin_pos = 0;
		
		var _swipeVote = function(el){
			var post_data = el.find('.vote-list-response').data("post"),
				curr_vote = el.find('.vote-list-response').data("bind"),
				vote_type = el.find('.vote-list-response').data("type");
				
			/////vote after release
			//console.log(el.parent().find('.swipe-love').width(), el.parent().find('.swipe-troll').width())
			if(el.parent().find('.swipe-love').width() == 60){
				var option_data = "SE",
					this_inside = el.find("#SE"),
					obj = [{"post": post_data, "option": option_data, "post_type": vote_type }, this_inside, curr_vote];
				
					Vote.makeVote(obj)
				
			}else if(el.parent().find('.swipe-troll').width() == 60){
				var option_data = "TR",
					this_inside = el.find("#TR"),
					obj = [{"post": post_data, "option": option_data, "post_type": vote_type }, this_inside, curr_vote];
				
				if(curr_vote != "TR"){
					message = "<h2>Three troll votes and this comment is deleted.<span></span></h2> <p>Are you sure you want to mark <br>this comment as Troll?</p>"
					Alert.loadAlert(['confirm', message, obj, Vote.makeVote])
		
				}else{
					Vote.makeVote(obj)
				}
				
			}
			
		
		}	
			
		var _moveBubble = function(el, pos){
			diff_pos = pos - origin_pos
			icon_width = Math.abs(diff_pos/2) 
			back_opacity = Math.abs(diff_pos/100)
			el.css({left:diff_pos + "px"})
			if (diff_pos > 0){
				el.parent().css({background:"rgba(242,140,140,"+back_opacity+")"})
				el.parent().find('.swipe-love').css({width:icon_width+"px"});
				
			}else{
				el.parent().css({background:"rgba(85,85,85,"+back_opacity+")"})
				el.parent().find('.swipe-troll').css({width:icon_width+"px"});
				
			}
				el.next().css({color:"#fff"})
				bkg_opacity += 0.04
			//console.log(diff_pos)
		}
		
		var _restoreBubble = function(el){

			////slide back after swipe
			el.css({transition: "left", transitionTimingFunction:'ease', transitionDuration: '0.2s', left:"0px" });
			el.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				el.css({transition: "none !important"});
			});
			
			////vote after release
			_swipeVote(el)
			
			
			el.parent().find('.swipe-love').removeAttr('style');
			el.parent().find('.swipe-troll').removeAttr('style');
			el.parent().removeAttr('style');
			el.next().removeAttr('style');
			bkg_opacity = 0;
			
			
			
		}
		
		var bind = function(){
			//console.log("bound")
			$(".bubble-middle").on("touchstart", function(e){
				origin_pos = e.originalEvent.touches[0].pageX;
				//console.log(e)
			});
			$(".bubble-middle").on("touchmove", function(e){
				var pos = e.originalEvent.touches[0].pageX;
				_moveBubble($(this), pos)
			});
			$(".bubble-middle").on("touchend", function(e){
				//var pos = e.originalEvent.touches[0].pageX;
				_restoreBubble($(this))
				//console.log(e)
			});
			
			///hide normal voting functionality
			$('.respo-vote-right').css({display:"none"})
			$(".middle-box").append('<div class="swipe-love"></div>')
			$(".middle-box").append('<div class="swipe-troll"></div>')
		}
		
		
		return{
			bind:bind
		}
			
		
	
	})();
		
	
	var DeletePost = (function(){
	
		var _remove = function(container, type){
			if(type == "response"){
				container.css({opacity:0, transition: "all", transitionTimingFunction:'ease', transitionDuration: '0.6s' });
				container.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					container.remove();
				});
			}else{
				container.css({opacity:0, transition: "all", transitionTimingFunction:'ease', transitionDuration: '0.6s' });
				container.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					UserView.load($(".user-view").scrollTop(), false);
				});
				
			}
		}
	
		var _hide = function(el, container){
			el.parent().addClass("bubble-deleted-user")
			el.parent().html("<p></p>")
			container.find(".date-user").html("Deleted")
		}
	
		var _threadOrResponse = function(el){
			var pk = el.data("post"),
				container = el.parent().parent();
		
			//only responses have ...
			if(el.data("thread")){
				var thread_id = el.data("thread"),
					post_type = "response";
				
			//////treads	
			}else{
				var thread_id = el.data("post"),
					post_type = "thread";
			}
		
			return {"pk": pk, "thread_id": thread_id, "post_type": post_type }
		
		}
	
		var run = function(el){
			var container = el.parent().parent(), 
				obj = _threadOrResponse(el, container);
		
			$.ajax({
				type: "POST",
				url: "/delete_post/",
				data: obj,
				success: function(response) {
					if (response.delete_or_hide == "delete"){
						_remove(container, response.type);
					
					}else{
						_hide(el, container);
					
					}

				},
				error: function(){
					AjaxError.show();
				}
			});
		}
		
		return{
			run: run
		}
	
	})();
	
	
	var AttachVoteDelete = (function(){
	 
 		var _styleEach = function(handle){
			///make sure vote is represented visually for each response 
			handle.find(".vote-list-response").each(function( index ) {
				if('ontouchstart' in document.documentElement){
					var vote_option = $(this).data("bind") == 'SE' ? 'touch-loved' : $(this).data("bind") == 'TR' ? 'touch-trolled' : ''; 
					$(this).parent().parent().append('<div class="'+vote_option+'"></div>')
				}else{
					if($(this).data("bind") == "SE"){
						$(this).find('#'+$(this).data("bind")).children("div:first").css({background:'#f28c8c'})
						$(this).find('#'+$(this).data("bind")).children("div:first").children("span:first").addClass('vote-heart-voted');
					}else{
						$(this).find('#'+$(this).data("bind")).children("div:first").css({background:'#666'})
						$(this).find('#'+$(this).data("bind")).children("div:first").children("span:first").addClass('vote-troll-voted');
					}
				}
			});
		}
	
		var _bindVotes = function(handle){
			//////attach click to each response for voting option
			handle.find(".vote-list-response li").click(function(){
	
				var option_data = $(this).data("vote"),
					post_data = $(this).parent().data("post"),
					curr_vote = $(this).parent().data("bind"),
					vote_type = $(this).parent().data("type"),
					this_inside = $(this),
					obj = [{"post": post_data, "option": option_data, "post_type": vote_type }, this_inside, curr_vote];
			
				if(option_data == "TR" && curr_vote != "TR"){
					message = "<h2>Three troll votes and this comment is deleted.<span></span></h2> <p>Are you sure you want to mark <br>this comment as Troll?</p>"
					Alert.loadAlert(['confirm', message, obj, Vote.makeVote])
		
				}// else if(option_data == "SE" && curr_vote == "SE"){
// 					message = "<h2>You sure?<span></span></h2> <p>Deleting this vote takes a point away <br>from your ranking</p>"
// 					Alert.loadAlert(['confirm', message, obj, Vote.makeVote])
// 				}
				else{
					Vote.makeVote(obj)
				}

			});
		}
		
		var _bindDelete = function(handle){
			////////attach delete response click
			handle.find(".respo-vote-left").click(function(){
		
				curr = $(this);
				message = "<h2>Are you sure you want to delete this post?<span></span></h2>";
				Alert.loadAlert(['confirm', message, curr, DeletePost.run]);
			
			});
		}
		
		var run = function(handle){
		
			_styleEach(handle)
			_bindVotes(handle)
			_bindDelete(handle)
		}
		
		return{
			run:run
		}
		
	})();
	
	
	var RestorePost = (function(){
		
		var _reloadHandle = function(handle){
			//console.log(handle)
			if (handle[0].className == "user-view"){
				UserView.load($(".user-view").scrollTop(), false);
			}else{
				var curr_id = handle.parent().parent().find(".post-user").data("thread");
				//console.log(handle.parent().parent().parent().parent().parent(), curr_id)
				OneThread.loadCurrThread(curr_id, handle, false)
			}
		}
		
		var _restore = function(el, handle){
			var type = el.data("type"),
				post_id = el.data("post")
		
			$.ajax({
				type: "POST",
				url: "/restore_post/",
				dataType: "json",
				data: { "type": type, "post_id": post_id},
				success: function(data) {
					//console.log(data.restored)
					if(data.restored == "true"){
						_reloadHandle(handle)
					}
				},
				error: function(){
					AjaxError.show();
				}
			});
		}
	
		var bind = function(handle){
			handle.find(".bubble-deleted-user").on("click", function(){
				_restore($(this), handle)	
			
			});
		}
	
		return{
			bind: bind
		}

	})();
	
	
	var Scroller = (function(){
		var page = $("html, body");
	 
		var _bindElOff = function(element){
			page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
			   element.stop();
		   });
		}


		var myScroller = function(element, position){
			//_bindElOff(element);

			element.animate({ scrollTop: position }, 1000, 'easeOutCirc', function(){
				//element.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
			});

		   return false; 

		}

		return{
			myScroller: myScroller
		}

	})();
	

	var Timer = (function(){
		
		var _getCurrTime = function(startTime){
			var time = parseFloat(startTime, 10),
				hrs = 24 - (time/86400 * 24),
				minutes = (hrs % 1) * 60;
		 
				 hrs = Math.floor(hrs)
				 minutes = Math.floor(minutes)
				 minutes = minutes.toString().length === 1 ? "0"+ minutes.toString() : minutes
			 
				 return [time, hrs, minutes]
			 
		}
	
		var addTime = function(startTime){
			var clock = $( "circle.pie" ),
			time_div = $(".time-text"),
			time_div_small = $(".time-text-small")
			radius = clock.parent().height()/2;
			circumference = 2 * Math.PI * radius
		
			time_parts = _getCurrTime(startTime)
			//console.log(circumference, time_parts)
			if(time_parts[0] < 86400){
				var off_set = (time_parts[0] / 86400) * circumference/2;//off_set.toString()
				off_set = (off_set).toString() + ' ' + circumference.toString();
				var stroke_w = radius + "px"
				
				//clock.attr('transform', 'rotate(-90 '+radius+' '+radius+')')
				clock.css({strokeWidth: stroke_w, strokeDasharray: off_set, transition: "stroke-dasharray", transitionTimingFunction:'ease', transitionDuration: '1s' });

				time_div.html(time_parts[1]+" hrs & "+time_parts[2]+" min left")
				time_div_small.html(time_parts[1]+":"+time_parts[2]+" left")
	
			}else{
	
				clock.css({strokeDasharray: '106.2 106.2', transition: "all", transitionTimingFunction:'ease', transitionDuration: '2s' });
				clock.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					clock.css({transition: "none !important"});
		
				});
			}

		}
		
		return{
			addTime: addTime
		}

	})();

	
	var Alert = (function(){
		
		var _createAlertBox = function(alert_array){
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
			okBtn.setAttribute("value", "ok" );
			okBtn.setAttribute("id", "ok" );
		
			/////append message & okbtn
			div.innerHTML = alert_array[1];
		
		
			///////on
			if(alert_array[0] == "confirm"){
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
		
		}
		
		var _bindBtns = function(alert_array){
			
			if(alert_array[0] == "confirm"){
				$('#ok').click(function(){
					alert_array[3](alert_array[2]);
					$(this).parent().parent().parent().remove()
					return true;
				});
		
				$('#no').click(function(){
					$(this).parent().parent().parent().remove()
					return false;
				});
				$('body').on('keydown', function(e){
					if(e.keyCode == '13' ){	
						//e.preventDefault();
						
						alert_array[3](alert_array[2]);
						$(".my-alert-wrapper").remove();
						$('body').off('keydown')
						return false;
					}
				});
			}else{
		
				$('#ok').click(function(){
					$(this).parent().parent().parent().remove()
					return true;
				});
				$('body').on('keydown', function(e){
					if(e.keyCode == '13' ){	
						//e.preventDefault();
						$(".my-alert-wrapper").remove();
						$('body').off('keydown')
						return false;
					}
				});
			}
		
		
		}
		
		var loadAlert = function(alert_array){
			$('textarea').blur();
			//alert_array[type, message, element, function]
			_createAlertBox(alert_array)	
			_bindBtns(alert_array)
			
		}
		
		return{
			loadAlert: loadAlert
			
		}
		
	
	})();
	

	var Character = (function(){
		
		var _charCount = function(this_text){

			var count = 142 - this_text.val().length;
	
			if(count > 0){
	
				this_text.parent().next().html(count);
				this_text.parent().next().data("max_char", this_text.val());
				
			}else{
	
				this_text.parent().next().html("<span style='color:red;'>0</span>");
				this_text.val(this_text.parent().next().data("max_char"));	
			}
		}
		
		
		var bindCharCount = function(this_text){
			////////limit characters that you can post to 142
			$(this_text).on("keyup", function(){
				_charCount(this_text);	
			});
			
		}
		
		var _init = function(){
			bindCharCount($("#id_text"))
		}
		
		_init()
		
		return{
			bindCharCount: bindCharCount
		}
	
		
	})();	


	var Keywords = (function(){ 
		
		var load = function(){
			$.ajax({
				type: "GET",
				url: "/keywords",
				success: function(data) {
					$("#keywords").html(data)
					initSorter.bindEach($('.keyword'))
					initSorter.initStyleStorage($('#keywords div'))
					
				},
				error: function(){
					AjaxError.show();
				}
			});
		}
		
		return{
			load: load
		}
    })();
	

	var Notify = (function(){
		
		var _highlight = function(el){
			
			el.css({transition:"background 0.7s", background:"#fef8cd"})
			el.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				setTimeout(function(){
					el.css({background:"#fff"})
					el.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
						el.removeAttr('style')
					});
				},1000)
			});
		}
		
		var _scrollToEl = function(el, scroll_el, el_parent){
			var to_highlight = (el.parent().parent().parent().attr('class') == 'middle-box') ? (el.parent().parent().parent()) : (el.parent().parent());

			
			console.log(scroll_el)
			///if window
			if(el_parent[0].self == el_parent[0]){
				//console.log(to_highlight.offset().top - 98 < scroll_el.height() - el_parent.height(), to_highlight.offset().top - 98, scroll_el.height() - el_parent.height())
				var position = to_highlight.offset().top - 98 < scroll_el.height() - el_parent.height() ? to_highlight.offset().top - 98 : scroll_el.height() - el_parent.height()
				
			}else{
				var position = to_highlight.position().top - el_parent.position().top < scroll_el.prop('scrollHeight') - scroll_el.height() ? to_highlight.position().top - el_parent.position().top : scroll_el.prop('scrollHeight') - scroll_el.height();
				//console.log(el.parent().parent().offset().top, scroll_el.offset().top )
			}
			
			scroll_el.animate({ scrollTop: position }, 500, 'easeOutCirc', function(){
				console.log((el.parent().parent().parent().attr('class') == 'middle-box'), el.parent().parent().parent().attr('class'), el.parent().parent().parent())
				_highlight(to_highlight);
				return false;
			});
			
		}
		
		var _findPost = function(handle, thread_id, pk, scroll_el, el_parent){
			$.each(handle, function(index, el){
				if($(this).data('post') == pk){
					_scrollToEl($(this), scroll_el, el_parent)
		
				}
			})
		}
	
		var _openThread = function(type, pk, thread_id){
			if(thread_id){
				OneThread.openPopUp($('#'+thread_id))
			}else{
				OneThread.openPopUp($('#'+pk))
			}
		
		}
		
		var _go = function(type, pk, thread_id){
			var center_check = $(".center").width() / $(window).width(),
				left_wrap = $('.left-wrap')
				toggled = left_wrap.css('left'),
				tog_btn = $("#fixed-top-right>ul>li:nth-child(3)"),
				curr_thread = $('.user-box-container').data('thread'),
				id_check = thread_id == "" ? pk : thread_id
				user_view = $('.user-view'),
				thread_div_pop = $('#thread-div-pop');
			
			///hide notifications	
			$('#pop-up-wrapper').remove();

			////toggle to Global View if necessary or back
			console.log(center_check == 1, toggled == '0px', curr_thread != id_check)
			if(center_check == 1  && toggled == '0px' && curr_thread != id_check){
				toggleView.toggle(tog_btn)
				left_wrap.one("transitionend", function(){
					
				///see toggle to get oriented
				//setTimeout(function(){
					_openThread(type, pk, thread_id)
					
					thread_div_pop.one("transitionend", function(){
						_findPost(thread_div_pop.find('.vote-list-response, .respo-vote-left'), thread_id, pk, thread_div_pop.find('.response-container'), thread_div_pop.find('.details'));
					});
				//}, 200)
				});
				
			}else if(center_check == 1  && toggled == '0px' && curr_thread == id_check){
				
				_findPost(user_view.find('.vote-list-response, .respo-vote-left'), thread_id, pk, $('body, html'), $(window));
			
			
			}else if(center_check == 1  && toggled != '0px' && curr_thread == id_check){
				toggleView.toggle(tog_btn)
				
				//setTimeout(function(){
				left_wrap.one("transitionend", function(){
					_findPost(user_view.find('.vote-list-response, .respo-vote-left'), thread_id, pk, $('body, html'), $(window));
				});
				//}, 200)
				
			
			}else if(center_check == 1  && toggled != '0px' && curr_thread != id_check){
				_openThread(type, pk, thread_id)
				//console.log($('#thread-div-pop').find('.details'))
				//setTimeout(function(){
				thread_div_pop.one("transitionend", function(){
					_findPost(thread_div_pop.find('.vote-list-response, .respo-vote-left'), thread_id, pk, thread_div_pop.find('.response-container'), thread_div_pop.find('.details'));
				});
				//}, 500)
				
			
			}else{
				if(curr_thread != id_check){
					_openThread(type, pk, thread_id)
				
					thread_div_pop.one("transitionend", function(){
						_findPost(thread_div_pop.find('.vote-list-response, .respo-vote-left'), thread_id, pk, thread_div_pop.find('.response-container'), thread_div_pop.find('.details'));
					});
				}else{
					_findPost(user_view.find('.vote-list-response, .respo-vote-left'), thread_id, pk, $('.user-view'), $('.user-box-container'));
				}
			}
			
			
		}
		
		var bind = function(){
			
			$('.notify').on('click', function(){
				_go($(this).data('type'), $(this).data('pk'), $(this).data('thread_id'))
			});
			
		}
		
		return{
		bind:bind
		}

	})();
	

	var CloseSorter = (function(){
	
		var toggleSorter = function(){
		
			var sorter_wrap = $(".center").width();
				sorter_wrap = sorter_wrap+"px";
			
			var sorter_div_right =  $(".center").width();
				sorter_div_right = sorter_div_right+"px";
	
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
		
		var _bindCloseBtn = function(){
			$('.sorter>div .close').on('click', function(){
				toggleSorter();
			});
		}
		
		var _bindMenu = function(){
			$("#fixed-top-right>ul>li:nth-child(2)").on("click", function(){
				toggleSorter();	
			});
		}
		
		_bindMenu()
		_bindCloseBtn()
		
		return{
			toggleSorter: toggleSorter
		}
		
	})();
	
	
	var toggleView = (function(){
		var left_wrap = $(".left-wrap"),
			drop_top = $('#drop-top');
			
		var _stickToTop = function(){
			var win = $(window);
			
			if (win.scrollTop() >= 60){
				$("#sticky-top").css({display:"block"});
				//$('#user .user-top').css({visibility:"hidden"});
				
			}else{
				$("#sticky-top").css({display:"none"});
				//$('#user .user-top').css({visibility:"visible"});
	
			}
		}
		
		var _adjustMainFeed = function(){
			//console.log($(window).scrollTop(), $('.center').height() - ($(window).height() - 137))
			if($(window).scrollTop() == $('.center').height() - ($(window).height() - 137)){
				AllThreads.loadThreadsOnScroll();
				AllThreads.showScrollToTop($(window));
			}else{
				AllThreads.showScrollToTop($(window));
			}
		}
		
		var toggle = function(el){
			var menu = $("#fixed-top-right ul li:nth-child(2)"),
				s2t = $('.scroll-to-top'),
				post_form_container = $('.post-form-container'),
				left_holder = $('.left-holder'),
				center = $('.center'),
				user_top = $('.user-top');
				
				
			if($(window).scrollTop() >= 60){
				$(window).scrollTop(60);	
			}
				
			if(left_wrap.css("left") == "0px"){
			//center
				$('#sticky-top').css({left:"-100%"});
				left_wrap.css({left:"-100%"});
				menu.css({width:"40px"});
				el.html('<div id="compose-ico"></div>');
				$('.scroll-to-top').css({display:"block"});
				post_form_container.css({display:'none'});
				
				//minimize height of user-box container to allow scroll on center
				left_holder.css({height:"calc(100vh - 36px)"});
				center.removeAttr('style');
			
			}else{
			//user-view
				$('#sticky-top').css({left:"0"});
				left_wrap.css({left:"0"});
				menu.css({width:"0px"}); 
				el.html('<div id="posts-ico"></div>');
				$('.scroll-to-top').css({display:"none"});
				post_form_container.removeAttr('style');
				
				///minimize height of .center div to allow scroll on user view 
				center.css({height:"calc(100vh - 36px)"})
				left_holder.removeAttr('style');
				
			}
		}
		
		var bind = function(){
			$("#fixed-top-right>ul>li:nth-child(3)").on("click", function(){
				toggle($(this))
			});
				$(window).on('scroll', function(){
					_stickToTop()
					_adjustMainFeed()
				});	
			
			//initialize user view
			var center_check = $(".center").width() / $(window).width();
			if(center_check == 1){
				$('.center').css({height:"calc(100vh - 36px)"})
			}
			
		}
		
		bind()
		
		return{
			toggle:toggle 
		}
		
	})();
	
	
	var Logout = (function(){
	
		var _logout = function(href){
			window.location = href
		
		
		}
		var _bindLogout = function(){
			$('#logout').on('click', function(e){
				e.preventDefault();
				href = $(this).attr("href");
				message = "<h2>Are you sure you want to logout?<span></span></h2>";
				Alert.loadAlert(['confirm', message, href, _logout]);
			});
		}
		
		_bindLogout()
	
	})();


    var ScrollToTop = (function(){
    	var center_check = $(".center").width() / $(window).width();
    	
    	var init = function(){
			if (center_check == 1){
				$('.scroll-to-top').click(function(){
					Scroller.myScroller($('body, html'), 0);
					//$('body, html').animate({ scrollTop: 0 }, 1000, 'easeOutCirc', function(){
						//element.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
					//});
				});	
			}else{
				$('.scroll-to-top').click(function(){
					Scroller.myScroller($('.main-feed'), 0);
				});
			}
		}
		
		init();
		
		return{
			init:init
		}
		
		
	})();
	
	
	var UTC2Local = (function(){
		var d = new Date(),
			n = d.getTimezoneOffset(),
			hr_offset = n/60;
			
		var convert = function(parent){
			
			var els = parent.find('.utc');
			$.each(els, function(index, el){
				
				var el_html = el.textContent;
				
				if(el_html.indexOf("am") == -1 || el_html.indexOf("pm") == -1){
			
					var time = el_html.split(':'),
						int_hr = parseInt(time[0]);
					
					//adjust for local
					var off_hr = int_hr - hr_offset
					
					
					if(off_hr < 0){
						var mil = 24 + off_hr;
					
					}else if(int_hr > 24){
						var mil = off_hr - 24;
					
					}else{
						var mil = off_hr;
					}
					
					//adjust for military time
					if(mil > 12){
						var ps = "pm",
						local_hr = mil - 12;
					}else{
						if (mil == 12){
							var ps = "pm"
						}else{
							var ps = "am"
						}
						
						if (mil == 0){
							local_hr = 12
						}else{
							local_hr = mil;
						}
							
					}
					
					local_time = local_hr.toString() + ":" + time[1] + " " + ps;
			
					els[index].textContent = local_time;
				}
			})
		}
		
		return{
			convert:convert
		}
	
	})();
	

	var AjaxError = (function(){
		var show = function(){
			//alert('error')
		}
		
		return{
			show:show
		}
	
	})();
	
		
	var initSorter = (function(){ 
		
		var initStyleStorage = function(el){
			el.each(function(){ //$('.sorter div')
				var this_div = $(this);
			
				if(!$.isEmptyObject(this_div.data())){
					$.each(this_div.data(), function(key, value) {
						
						if(key != "contains"){
							//console.log(this_div.data())
							if(localStorage.getItem(key) == value){
								this_div.css({background: 'rgba(251, 249, 234, 1)'});
						
							}//dope green blue rgb(239, 243, 242)224, 229, 235
						}
					});
				}
			});
			
			
		}
		var _closeMenuOnQuery = function(this_div){
			this_div.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					CloseSorter.toggleSorter()
			});
		}
		
		var _query = function(this_div){
			var center_check = $(".center").width() / $(window).width();
			//if(center_check < 0.5){
				$(".main-feed")[0].style.opacity = 0;
			//}
			
			if(!$.isEmptyObject(this_div.data())){
					$.each(this_div.data(), function(key, value) {
			
						if(this_div.attr('rel')){
							localStorage.setItem(this_div.attr('rel'),"");
						}
				
						if(localStorage.getItem(key) == value){
							localStorage.setItem(key,"");
							AllThreads.load(key, "");
							
							this_div.css({background:'transparent'});
							
							if(center_check > 0.5 && $('.sorter').css("right") == "0px"){
								// _closeMenuOnQuery(this_div)
								CloseSorter.toggleSorter()
							}
							
						}else{
							localStorage.setItem(key,value);
							AllThreads.load(key, value);
							
							if(key == "pub" || key == "pop"){
								this_div.parent().children().css({background:'transparent'});
								
								
								// this_div.parent().children('div').attr('class','sort')

							}else if(key == "contains"){
								$("#keywords>div").children().css({background:'transparent'});
								$("#search-box").css({background:'transparent'});
								$("#search-box").data("contains","");
								$('#search-text').attr("placeholder","Search");
								
							}
							
							this_div.css({background: 'rgba(251, 249, 234, 1)'});
							
							if(center_check > 0.5  && $('.sorter').css("right") == "0px"){
								// _closeMenuOnQuery(this_div)
								CloseSorter.toggleSorter()
							}
					
						}
					});
				}
			
		}
		
		var bindEach = function(el){
			 el.on(' click',function(){
				var this_div = $(this);
				_query(this_div)
		
			});
			
			$('#search-text').on('focus', function(){
				$(this).parent().css({background:"rgba(251, 249, 234, 1)"})
				$(this).attr("placeholder", "Search")
			})
			$('#search-text').on('blur', function(){
				$(this).parent().css({background:"transparent"})
			})
			$('#search-text').on('keydown', function(e){
				if(e.keyCode == '13' ){	
					e.preventDefault();
					$(this).parent().data("contains", $(this).val())
					
					_query($(this).parent())
					$(this).attr("placeholder", '"'+$(this).val()+'"')
					$(this).val("")
					$(this).blur()
				}
			});
			$('#search-threads').click(function(){
				$(this).parent().data("contains", $(this).next().val())
				_query($(this).parent())
				$(this).next().attr("placeholder", '"'+$(this).next().val()+'"')
				$(this).next().val("")
			})
		
		}
		
		var _init = function(){
			initStyleStorage($('.sorter div'));
			bindEach($('.sorter .sort, .sorter .keyword'));
		}
		
		_init()
		
		return{
			initStyleStorage:initStyleStorage,
			bindEach:bindEach
		}
		
	})();

	// CSRF code
	(function(){
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
	})();
	
	////status and notification
	(function() {
		
		////add and bind close btn to this
		
		var _createPopUp =  function(data, type){
		
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
			popUpWrapper.style.left = "-100%";
			popUpDiv.style.left = "-100%";
	
			setTimeout(function () {
				popUpWrapper.style.opacity = 1;
				popUpDiv.style.opacity = 1;
				popUpWrapper.style.left = "0px";
				popUpDiv.style.left = "0px";
			}, 30);
		
		}
		
		var _close = function(e, removePop){
			
			// var pop_top = parseInt($("#pop-up-wrapper").css("top")),
// 				pop_left = parseInt($("#pop-up-wrapper").css("left")),
// 				pop_height = $("#pop-up-wrapper").height() + pop_top,
// 				pop_width = $("#pop-up-wrapper").width() + pop_left;
// 			
// 			
// 			if ( e.clientX > pop_left && e.clientX < pop_width && e.clientY > pop_top && e.clientY < pop_height){
// 				return false;	
// 				
// 			}else{
				///make this smoother eventually
				$('#pop-up-wrapper').remove();
				//$('body').off('click',removePop);
				
			//}
		}
		
		var _bindClose = function(){
			// $('body').on('click', function removePop(e){
// 				_close(e, removePop)
// 				
// 			});
			$('.close-btn, #fixed-top-right ul li:nth-child(2), #fixed-top-right ul li:nth-child(3)').on('click', function removePop(e){
				_close(e, removePop)
				
			});
		}
		
		var _loadData = function(el, type){
		
			$.ajax({
				type: "GET",
				url: "/"+type+"/",
				success: function(data) {
		
					el.data('hold', 'off');
					
					_createPopUp(data, type);
			
					_bindClose()
					
					if(type == 'notifications'){
						
						UTC2Local.convert($('#status-wrap'))
						
						Notify.bind()
					}
				},
				error: function(){
					$('#pop-up-wrapper').remove();
					AjaxError.show();
				}
			});
		
		}
		
		
		var _checkState = function(el){
			var type = el.data('type'),
				wrapper = $('#pop-up-wrapper');
		
			if(wrapper.length && wrapper.data('type') == type){
				wrapper.remove()

			}else{
				if(el.data('hold') == "off"){
					el.data('hold', 'on');
				
					wrapper.remove()
					
					_loadData(el, type)
					
				}
			}
		}
		
		var _bindStatusNotify = function(){
			$('#fixed-top-left>ul>li').on('click', function(){
				_checkState($(this))
			});
		}
		
		
		_bindStatusNotify()
	
	})();
	
	////toggle user-view and main-feed
	
	
	
	
	//resize functions ---- much work to do here
	(function(){
	//////fix for #fixed-side & .post-form-container on resize of screen so either div is not ever hidden from view
		$(window).resize(function(){
			//$("#inner-height").html($(window).innerHeight())
			//console.log('resize')
			////try to target elements that need to change on resize
			//ScrollToTop.init() 
		
			
			var center_check = $(".center").width() / $(window).width();
			///phone
			if(center_check == 1){
				// if($(".content-wrap").css("left") == "0px"){
	// 				$(".content-wrap").css({left:"0",height:""})
	// 			}else{
	// 				$(".content-wrap").css({left:"-100%",height:""})
	// 			}
				$(".content-wrap").removeAttr("style")
				//$("#fixed-top-right ul li:nth-child(2)").css({width:"0px"});
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
	})();
	
	/////////Pretty Lights!!!
	(function prettyTitle() {
		$( "header span, .post-user p:nth-child(1) span").each(function(i, el){
			var theSpan = $(this);
			setTimeout(function(){
		   	if(theSpan.parent().prop("tagName") == "P"){
 		   		//response titles
				var color1 = "#6e7277"; //white
				var color2 = "#bdbfc2"; //another grey blue, lighter
				var color3 = "#9fa3a7"; ///actually dark blue/grey
			}else{
 				//main title
				var color1 ="#fef8cd"; //yellow
				var color2 = "#ffbaa2"; //salmon
				var color3 = "#fff"; //white
				
			}	theSpan.css({color: color2, transition: "color", transitionTimingFunction:'ease', transitionDuration: '6s' });
				theSpan.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
					theSpan.css({color: color1, transition: "color", transitionTimingFunction:'ease', transitionDuration: '6s' });
					theSpan.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
						theSpan.css({color: color3, transition: "color", transitionTimingFunction:'ease', transitionDuration: '6s' });
					});
				});
		
			},100 + ( i * 500 ));
		});
    	setTimeout(prettyTitle, 25000);
	})();////////////end of PrettyLights

	////////when all is loaded, updatePage
	(function updatePage(){
 		
 		//check for local storage 'curr_page_state' deal with user first time visiting the site with no local storage item 'curr_page_state'
		
		var _checkStorage = function(){
			if(localStorage.getItem('curr_page_state') === null){
			
				var state = {};
				localStorage.setItem('curr_page_state', JSON.stringify(state))
				var last_state = state;
			
			}else{
				var state = localStorage.getItem('curr_page_state');
				var last_state = []
				last_state = JSON.parse(state);
			}
			
			return last_state
			
		}

		var runUpdate = function(){
		
			var last_state = _checkStorage()
		
			$.ajax({
				type: "POST",
				url: "/update_page/",
				dataType: "json",
				data: last_state,
				success: function(data) {
 
					console.log(data, last_state)	
								
					//update thread
					if(data.last_thread != last_state.last_thread || data.last_response != last_state.last_response || data.last_tvote != last_state.last_tvote || data.last_rvote != last_state.last_rvote){
						AllThreads.load('_', '_');
						
						///update open thread if any responses or votes have been made
						var handle = $("#thread-div-pop").find('.details'),
							curr_id = $("#thread-div-pop").children().first().data("thread");
							
						if($("#thread-div-pop").css("display") == "block"){
							OneThread.loadCurrThread(curr_id, handle, false)
					
						}
						
						Keywords.load()	 
						
					} 
					//update user_view with scroll --- responses
					if(data.my_last_thread_responses != last_state.my_last_thread_responses){
						UserView.load($(".user-view").scrollTop(), true);
					}
					//update user_view without scroll --- votes --- deletes
					if(data.my_last_thread_tvote != last_state.my_last_thread_tvote || data.my_last_thread_rvote != last_state.my_last_thread_rvote || data.my_deleted != last_state.my_deleted  || data.my_trolled != last_state.my_trolled || data.my_thread_active != last_state.my_thread_active){
						UserView.load($(".user-view").scrollTop(), false);
					
						
					}
					if(data.timediff != last_state.timediff){
						//update user clock
						 Timer.addTime(data.timediff)
					 
					 }
					 
					//store in localStorage
					localStorage.setItem('curr_page_state', JSON.stringify(data));
				},
				error: function(){
					AjaxError.show();
				}
			});
		}
		
 		runUpdate();
 		
 		setTimeout(updatePage, 10000)
 	})();
	
	
});//////endtag
