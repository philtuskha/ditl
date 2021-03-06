import json
from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q, Count
from django.template.context import RequestContext
from django.http import Http404, HttpResponse, HttpResponseRedirect
from .models import Thread, TVote, Response, RVote, UserProfile, User
from .forms import ThreadForm, TVoteForm, ResponseForm, RVoteForm
from django.contrib.auth.models import Permission, User
from django.contrib.auth import authenticate, login
from nltk import sent_tokenize, word_tokenize, pos_tag
from django.utils.html import strip_tags
from itertools import chain
from operator import attrgetter
from django.utils.crypto import get_random_string
from django.conf.urls import include, url

#attach this to log in/page load/user_view. Attach another check to add posts and vote that initially checks the user profile for the date they get reinstated 
def troll_check(user_id):
    my_threads = Thread.objects.filter(author_id=user_id)
    my_respos = Response.objects.filter(author_id=user_id)
    profile = UserProfile.objects.get(user_id=user_id)
    
    
    past_day = timezone.now() - timezone.timedelta(days=1)
    
    one_t_count = my_threads.filter(published_date__gte=past_day, is_active=2).count()
    one_r_count = my_respos.filter(published_date__gte=past_day, is_active=2).count() 
    
    one_day_count = one_t_count + one_r_count
    
    
    past_5_days = timezone.now() - timezone.timedelta(days=5)
    
    five_t_count = my_threads.filter(published_date__gte=past_day, is_active=2).count()
    five_r_count = my_respos.filter(published_date__gte=past_day, is_active=2).count() 
    
    five_day_count = five_t_count + five_r_count
    
    if not profile.troll_check: 
        if one_day_count > 2:
            if five_day_count > 4:
                profile.troll_check = timezone.now() + timedelta(days=7)
                profile.save()
            else:
                profile.troll_check = timezone.now() + timedelta(days=1)
                profile.save()
        
    elif profile.troll_check:
        if profile.troll_check < timezone.now():
            if five_day_count > 4:
                profile.troll_check = timezone.now() + timedelta(days=7)
                profile.save()
            else:
                profile.troll_check = None
                profile.save()
      

def profile_test(request):
    profile_object = UserProfile.objects.get(user_id=request.user.id)
    
    #reset
    # profile_object.activity_threads = ""
#     profile_object.activity_responses = ""
#     profile_object.activity_votes = ""
#     profile_object.save()
    
    a = profile_object
    b = profile_object.activity_threads
    c = profile_object.activity_responses
    d = profile_object.activity_votes
    e = profile_object.origin_date
    
    
    
    
    
    return render(request, 'blog/profile_test.html', {'a': a, 'b': b, 'c': c, 'd': d, 'e': e })
 
def find_faves(user_id):
    all_respo = Response.objects.filter(author_id=user_id)
    fave_users = []
    
    for r in all_respo:
        respo_thread = Thread.objects.get(pk=r.thread_id)
        thread_author = respo_thread.author_id
        
        if thread_author not in fave_users:    
            fave_users.append(thread_author)
    
    all_t_votes = TVote.objects.filter(user_id=user_id)
    
    for tv in all_t_votes:
        tvote_thread = Thread.objects.get(pk=tv.post_id)
        tvote_author = tvote_thread.author_id
        
        if tvote_author not in fave_users:    
            fave_users.append(tvote_author)
    
    
    all_r_votes = RVote.objects.filter(user_id=user_id)
    
    for rv in all_r_votes:
        rvote_response = Response.objects.get(pk=rv.post_id)
        rvote_author = rvote_response.author_id
        
        if rvote_author not in fave_users:    
            fave_users.append(rvote_author)
    
        
    return fave_users


def post_status(post_object, type, post_id):
    last_day = timezone.now() - timezone.timedelta(days=1)
    
    if type == "thread":
        troll_votes = TVote.objects.filter(published_date__gte=last_day, post=post_id, option="TR")
        
    elif type == "response":
        troll_votes = RVote.objects.filter(published_date__gte=last_day, post=post_id, option="TR")
    
    
    if troll_votes.count() >= 2:
        post_object.is_active = 2
        post_object.save()
    else:
        post_object.is_active = 0
        post_object.save()
        

def vote(request):
    t_check = UserProfile.objects.get(user_id=request.user.id).troll_check    

    if request.method=="POST" and t_check is None:
        user_thread_votes = TVote.objects.filter(user=request.user)
        user_respo_votes = RVote.objects.filter(user=request.user)
            
        #check whether the vote is for thread or response
        if request.POST.get('post_type') == "thread":
            form=TVoteForm(request.POST)
            old_vote = user_thread_votes.filter(post=request.POST.get('post'))
            post_object = Thread.objects.get(id=request.POST.get('post'))
            
        elif request.POST.get('post_type') == "response":
            form=RVoteForm(request.POST)
            old_vote = user_respo_votes.filter(post=request.POST.get('post'))
            post_object = Response.objects.get(id=request.POST.get('post'))
        
        
        if form.is_valid():
            #add or subtract from your favorites in UserProfile
            add_subtract_faves = 0 
            
            #define this outside of parent function so status can use but needs to return two different things
            def troll_vote_status(user_thread_votes, user_respo_votes):
                thread_vote_count = user_thread_votes.filter(option="TR").count()
                respo_vote_count = user_respo_votes.filter(option="TR").count()
    
                vote_count = thread_vote_count + respo_vote_count
    
                if vote_count is 6:
                    #send WARNING notification message to notification center
                    return ("warning", """<h2>Whoa, pump the brakes there, Troll Hunter.</h2>  
                                            <p>You can only have six troll votes at any given time.  
                                            One more troll vote, and you will have your troll voting privileges revoked.</p> """)
        
                elif vote_count > 6:
                    #send RESTRICTED notification message to notification center
                    return ("restricted", """<h2>Troll Hunter!!</h2>  
                                            <p>Your troll voting is now restricted. 
                                            You can still vote positively, but we don't allow vigilante troll hunting.
                                            Delete some of your troll votes.
                                            Or, just wait until tomorrow.</p>""")
                                        
                else:
                    return ("ok", "")   
            
            def which_vote(num):
            
                if num > 0:
                    vote.user=request.user
                    vote.published_date=timezone.now()
                    vote.save()
                
                #add or subtract from your favorites in UserProfile
                if request.POST.get('option') == "SE":
                    add_subtract_faves = num
                else:
                    add_subtract_faves = -1 * num
                    
                    #only if troll vote, check/set status 
                    post_status(post_object, request.POST.get('post_type'), request.POST.get('post'))
                    
                th_check, message = troll_vote_status(user_thread_votes, user_respo_votes)
                
                
                
                #faves("vote", request.POST.get('post'), post_object, add_subtract_faves, request.user.id)
                # activity("vote", num, request.user.id)
                
                data = {'option': request.POST.get('option'), 'post': request.POST.get('post'), 'num': num, 'th_check': th_check, 'message': message}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
                
            vote=form.save(commit=False)
            #checking to see if post has already been voted for, voting for or revoting thereafter
            if old_vote.count() > 0 and old_vote[0].option != request.POST.get('option'):
                
                old_vote.delete()
                return which_vote(1)
                
            elif old_vote.count() > 0 and old_vote[0].option == request.POST.get('option'):
                
                old_vote.delete()
                return which_vote(-1)
                
            else:
                
                return which_vote(1)
                
                
            
                
        else:
            terror = form.errors
            return HttpResponse(json.dumps(terror), content_type='application/json')

    else:
        message = "<h2>You are a troll</h2> <p>You have to wait until " + t_check.strftime('%b %d, %-I:%M%p') + " to start voting on posts again</p>"
        data = {"troll": "True", "message": message}
        return HttpResponse(json.dumps(data), content_type='application/json')

   
def thread_new(request):
    if request.method == "POST":
        form = ThreadForm(request.POST)
        if form.is_valid() and request.user.has_perm('blog.start_thread'):
            thread = form.save(commit=False)
            thread.author = request.user
            thread.published_date = timezone.now()
            thread.save()
            return redirect('thread_detail', pk=thread.pk)
    else:
        form = ThreadForm()
    return render(request, 'blog/thread_edit.html', {'form': form})


def restore_post(request):
    if request.method=="POST" and request.is_ajax():
        if request.POST.get('type') == "response":
            respo_restore = Response.objects.get(id=request.POST.get('post_id'))
            respo_restore.is_active = 0
            respo_restore.save()
            
        else:
            thread_restore = Thread.objects.get(id=request.POST.get('post_id'))
            thread_restore.is_active = 0
            thread_restore.save()
            
        data = {'restored': "true"}
        return HttpResponse(json.dumps(data), content_type='application/json')
        

def delete_post(request):
    if request.method=="POST" and request.is_ajax():
        respos_to_thread = Response.objects.filter(thread_id=request.POST.get('thread_id'))
        
        #check whether the delete is for thread or response
        if request.POST.get('post_type') == "thread":
            delete_this = Thread.objects.get(pk=request.POST.get('pk'), author=request.user)
            
            if respos_to_thread.count() == 0:
                delete_this.delete()
            
                # activity("thread", -1, request.user.id)
                
                delete_or_hide = "delete"
                type = "thread"
                
            else:
                delete_this.is_active = 1
                delete_this.save()
                
                delete_or_hide = "hide"
                type = "thread"
            
                
    
        elif request.POST.get('post_type') == "response":
            last_response = respos_to_thread.order_by("pk").reverse()[0]
            last_response_id = last_response.id
            
            if last_response_id == int(request.POST.get('pk')):
                delete_this = respos_to_thread.filter(pk=request.POST.get('pk'), author=request.user)
                delete_this.delete()
            
                # activity("response", -1, request.user.id)
                
                delete_or_hide = "delete"
                type = "response"
                
            else:
                hide_this = respos_to_thread.get(pk=request.POST.get('pk'), author=request.user)
                hide_this.is_active = 1
                hide_this.save()
                
                delete_or_hide = "hide"
                type = "response"

            
        data = {'delete_or_hide': delete_or_hide,"type": type}
        return HttpResponse(json.dumps(data), content_type='application/json')
        
    
def add_thread(request):
    #add thread or response
    t_check = UserProfile.objects.get(user_id=request.user.id).troll_check 

    if request.method == "POST" and request.is_ajax() and t_check is None:
        user_thread = Thread.objects.filter(author_id=request.user.id)
    
        if user_thread.count() > 0:
            my_last_thread = user_thread.order_by("pk").reverse()[0]
            t = timezone.now() - my_last_thread.published_date #raised an error somehow on this line during load failure
            timediff = t.total_seconds() #86400 seconds in a day
        else:
            timediff = 90000
            
            
        #check if new Thread or Response 
        if timediff > 86400 and request.POST.get('is_thread') == 'True': #request.user.has_perm('blog.add_thread'):
            form = ThreadForm(request.POST)
            time_check = True
            
        else:
            active_check = Thread.objects.get(id=request.POST.get('id')).is_active
            form = ResponseForm(request.POST)
            time_check = False
        
        #check which form the 
        if request.POST.get('is_thread')  == 'True':
        
            #checking if valid form AND checking if user is allowed to post a new thread
            if form.is_valid() and time_check == True:
                thread = form.save(commit=False)
                thread.author = request.user
                thread.published_date = timezone.now()
                thread.save()
                
                # activity("thread", 1, request.user.id)
                
                data = {"active": "True"}
                return HttpResponse(json.dumps(data), content_type='application/json')
            
            
            elif form.is_valid() and time_check == False and active_check == 0:
                curr_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
            
                response = form.save(commit=False)
                response.thread = curr_thread #Thread.objects.get(pk=request.user.profile.curr_thread)
                response.author = request.user
                response.published_date = timezone.now()
                response.save()
                
                curr_count = curr_thread #Thread.objects.get(pk=request.user.profile.curr_thread) # .values_list('resp_count', flat=True)
                curr_count.resp_count = curr_count.resp_count + 1
                curr_count.save() 
                
                # activity("response", 1, request.user.id)
                
                data = {"active": "True"}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
            else:
            
                data = {"active": "False"}
                return HttpResponse(json.dumps(data), content_type='application/json')    
                
        
        else:
            if form.is_valid() and active_check == 0:
                response = form.save(commit=False)
                response.thread = Thread.objects.get(pk=request.POST.get('is_thread'))
                response.author = request.user
                response.published_date = timezone.now()
                response.save()
                
                curr_count = Thread.objects.get(pk=request.POST.get('is_thread')) # .values_list('resp_count', flat=True)
                curr_count.resp_count = Response.objects.filter(thread=request.POST.get('is_thread')).count()
                curr_count.save() 
                
                #faves("response", request.POST.get('is_thread'), response.thread, 1, request.user.id)
                # activity("response", 1, request.user.id)
                
                data = {"active": "True"}
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:
            
                data = {"active": "False"}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
    else:
        message = "<h2>You are a troll</h2> <p>You have to wait until " + t_check.strftime('%b %d, %-I:%M%p') + " to start posting again</p>"
        data = {"troll": "True", "message": message}
        return HttpResponse(json.dumps(data), content_type='application/json')
  
    
def user_view(request):
    if request.user.id:
        my_threads = Thread.objects.filter(author_id=request.user.id)
        
        if my_threads.count() > 0:
            curr_thread = my_threads.order_by("pk").reverse()[0]
        
            diff = timezone.now() - curr_thread.published_date
            timediff = diff.total_seconds()
    
            respo = Response.objects.filter(published_date__lte=timezone.now(), thread=curr_thread.id).order_by('published_date')
        else:
            timediff = 0
            curr_thread = 0
            respo = []
            
        user=request.user
        return render(request, 'blog/user_view.html', {'curr_thread': curr_thread, 'user': user, 'respo': respo, 'timediff': timediff })
    else:
        return render(request, 'blog/user_view.html', {})


def update_page(request):
    # query on Posts, User View, Notifications, Status, Keywords(Trending) to see if database hase changed
    
    def return_last_id_from_table(table, value):
        get_request_value = request.GET.get(value)

        if get_request_value:
            count = table.objects.filter(id__gte=get_request_value).count()
            return_value = get_request_value + count
        
        else:
            try:
                return_value = table.objects.all().order_by("pk").reverse()[0].id
            except (IndexError, ValueError):         #list index out of range
                return_value = 0
    
        return return_value 
    
    last_thread = return_last_id_from_table(Thread, 'last_thread')
    last_response = return_last_id_from_table(Response, 'last_response')
    last_tvote = return_last_id_from_table(TVote, 'last_tvote')
    last_rvote = return_last_id_from_table(RVote, 'last_rvote')
    
    # last_day = timezone.now() #- timezone.timedelta(days=1)
#     my_last_thread = Thread.objects.filter(author_id=request.user.id, published_date__gte=last_day).order_by("pk").reverse()[0]
#     
    # if not my_last_thread:
    try:
        #my_last_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
        #my_last_thread = Thread.objects.filter(author_id=request.user.id, published_date__gte=one_day)[0]
        #last_day = timezone.now() - timezone.timedelta(days=1)
        my_last_thread = Thread.objects.filter(author_id=request.user.id).latest('published_date')

    except (IndexError, ValueError):
        my_last_thread = 0
        my_last_thread_responses = 0
        my_last_thread_tvote = 0
        my_last_thread_rvote = 0
        my_thread_active = 0
        my_deleted = 0
        my_trolled = 0
    
    else:
        all_responses = Response.objects.all()  
        curr_thread_respo = all_responses.filter(thread_id=my_last_thread.id)                            
        my_last_thread_responses = curr_thread_respo.exclude(author_id=request.user.id).count()
        my_last_thread_tvote = TVote.objects.filter(post_id=my_last_thread.id).count()
        
        #check for new inactive reponses
        my_thread_active = my_last_thread.is_active
        my_deleted = all_responses.filter(is_active=1).count()
        my_trolled = all_responses.filter(is_active=2).count()
        
        #you can do this better
        x = 0
        for r in curr_thread_respo:
            x += RVote.objects.filter(post_id=r.id).count()
       
        my_last_thread_rvote = x

    if my_last_thread is not 0:    
        diff = timezone.now() - my_last_thread.published_date
        timediff = diff.total_seconds()
    else:
        timediff = 0
    
    troll_check(request.user.id)
        
      
    data = {'last_thread': last_thread, 
            'last_response': last_response, 
            'last_tvote': last_tvote, 
            'last_rvote': last_rvote, 
            'my_last_thread_responses': my_last_thread_responses, 
            'my_last_thread_tvote': my_last_thread_tvote, 
            'my_last_thread_rvote': my_last_thread_rvote, 
            'timediff': timediff, 
            "my_deleted": my_deleted, 
            "my_trolled": my_trolled, 
            "my_thread_active": my_thread_active}
    return HttpResponse(json.dumps(data), content_type='application/json')
        

def keyword_extends(user):
    
    last_day = timezone.now() - timezone.timedelta(days=1)
    thread = Thread.objects.filter(published_date__gte=last_day).exclude(author_id=user)
    response = Response.objects.filter(thread__published_date__gte=last_day).exclude(thread__author_id=user)
    all_text = [response, thread]
    
    most_used_nouns = {}
    nouns = ['NN', 'NNP', 'NNS', 'NNPS']
    pre = ['JJ', 'JJR', 'JJS', 'UH', 'VB', 'VBD', 'VBG', 'VBN', 'PRP$', 'RB']
    
    for all in all_text:
        for r in all:
            stripped_text = strip_tags(r.text)
            tokens = word_tokenize(stripped_text)
            tagged = pos_tag(tokens)
            p_word = p_type = word = type = x_word = x_type = ""
    
            for t in range(0, len(tagged)):
                word, type = tagged[t]
                
                if t is not 0:
                    p_word, p_type = tagged[t-1]
                    
                    
                if t+1 < len(tagged):
                    x_word, x_type = tagged[t+1]
                else:
                    x_word, x_type = ("", "")
                
                
                if type in nouns and (p_type in pre or x_type in nouns):
                    if x_type not in nouns:
                        x_word = ""
                
                    if p_type not in pre:
                        p_word = ""
                
                    try:
                        conj = "%s %s %s" % (p_word.lower(), word.lower(), x_word.lower())
                        conj = conj.strip().title()
                        most_used_nouns[conj] = most_used_nouns[conj]+1
                    except KeyError:
                        most_used_nouns[conj] = 1
                
                elif type is "#":
                    
                    try:
                        conj = "%s%s" % (word.lower(), x_word.lower())
                        conj = conj.strip().title()
                        most_used_nouns[conj] = most_used_nouns[conj]+1
                    except KeyError:
                        most_used_nouns[conj] = 1
                    
                    
    sorted_nouns = sorted(most_used_nouns.items(), key=lambda x: x[1], reverse=True)
    return sorted_nouns

    
def keywords(request):  
    sorted_nouns = keyword_extends(request.user.id)        
    return render(request,'blog/keywords.html',{'sorted_nouns':sorted_nouns})


def notifications(request):
    user = request.user.id
    last_day = timezone.now() - timezone.timedelta(days=1)
    
    #all_threads
    all_threads = Thread.objects.all()
    
    try:
        #all threads that aren't mine written in the last day -- send to combine
        others_threads = all_threads.filter(published_date__gte=last_day).exclude(author_id=user)
        
    except:
        pass
    
    
    #all responses/all rvotes/all tvotes
    responses = Response.objects.all()
    all_rvotes = RVote.objects.all()
    all_tvotes = TVote.objects.all()
    
    #these are threads that I have commented on
    my_tvote_posts = others_threads.filter(tvote__user_id=user)
    
    #these are threads where I have voted on a response
    my_rvote_posts = others_threads.filter(response__rvote__user_id=user)
    
    #these are threads that I have voted for the post itself
    my_response_posts = others_threads.filter(response__author_id=user)
    
    #combine and get distinct
    my_conversations = my_tvote_posts | my_rvote_posts | my_response_posts
    my_conversations = my_conversations.distinct()
    
    #all responses in my conversations  -- send to combine
    my_convo_responses = responses.filter(thread__id__in=my_conversations, published_date__gte=last_day).exclude(author_id=user)
   
    
    #responses that I have made on threads posted in the last day
    my_respo = responses.filter(author_id=user, thread__published_date__gte=last_day)
    #votes for responses I have made
    my_respo_rvotes = all_rvotes.filter(post_id__in=my_respo, published_date__gte=last_day)
    
    ##################################### my current thread ###################
    
    #_set example
    #t_votes = th.tvote_set.filter(option="SE").count()
    
    #my current thread
    my_last_thread = all_threads.filter(author_id=user, published_date__gte=last_day)
    
    if my_last_thread:
        latest_thread = my_last_thread.latest('published_date')
    
        #responses to my current thread
        curr_all_respo = responses.filter(thread_id=latest_thread.id)
    
        #responses to my current thread by others -- send to combine
        curr_thread_respo = curr_all_respo.exclude(author_id=user)
    
        #all thread votes on my current thread -- send to combine
        curr_thread_tvotes = all_tvotes.filter(post_id=latest_thread.id).exclude(user_id=user)
    
        #all response votes on my current thread -- send to combine
        #curr_thread_rvotes = all_rvotes.filter(post_id__in=curr_all_respo).exclude(user_id=user)
    else:
       
        curr_thread_respo = iter([])
        curr_thread_tvotes = iter([])
    
    ################################## combine all into iterable object sorted by date ####################
    
    #combine/sort/reverse order
    responses = sorted(
        chain(others_threads, my_convo_responses, my_respo_rvotes, curr_thread_respo, curr_thread_tvotes),  #, curr_thread_rvotes
        key=attrgetter('published_date'),
        reverse=True)

    return render(request,'blog/notifications.html',{'user':user,'responses':responses})

def status(request):
    if request.user.id:
        profile = UserProfile.objects.all()
        user=request.user.id
        total_users = profile.count()
        
        all_threads = Thread.objects.all()
        all_respos = Response.objects.all()
        last_14_days = timezone.now() - timezone.timedelta(days=14)
        last_day = timezone.now() - timezone.timedelta(days=1)
              
        last_threads = all_threads.filter(published_date__gte=last_14_days)
        last_respos = all_respos.filter(published_date__gte=last_14_days)
        last_tvotes = TVote.objects.filter(published_date__gte=last_14_days)
        last_rvotes = RVote.objects.filter(published_date__gte=last_14_days)
        
        #user activity
        user_rank = []
        for p in profile:
            p_id = p.user_id
            
            user_threads = last_threads.filter(author_id=p_id).exclude(is_active=1).exclude(is_active=2).count() * 5
            user_respo = last_respos.filter(author_id=p_id).exclude(is_active=1).exclude(is_active=2).count() * 3
            user_tvotes = last_tvotes.filter(user_id=p_id).count()
            user_rvotes = last_rvotes.filter(user_id=p_id).count()
            
            user_total = user_threads + user_respo + user_tvotes + user_rvotes
        
            user_rank.append((p_id, user_total)) 
    
        user_rank = sorted(user_rank, key=lambda tup: tup[1], reverse=True)
        max_activity_points = user_rank[0][1]
        my_user_rank = next((i for i, v in enumerate(user_rank) if v[0] == user), None) + 1
        user_rank_dict = dict(user_rank)
        my_activity_points = user_rank_dict[user]
        total_activity_points = sum(x[1] for x in user_rank)
       
        activity_list = [user_rank, my_user_rank, max_activity_points, my_activity_points, total_activity_points]
        
        
        #thread popularity
        thread_rank = {}
        for th in last_threads:
            t_votes = th.tvote_set.filter(option="SE").count()
            respo = Response.objects.filter(thread_id=th.id).exclude(author_id=th.author_id).exclude(is_active=1).exclude(is_active=2)
            r_count = respo.count() * 3
            
            if(respo.count() is not 0):
                for r in respo:
                    r_votes = r.rvote_set.filter(option="SE").count()  
            else:
                 r_votes = 0
                            
            total = t_votes + r_votes + r_count
            
            
            if th.author_id in thread_rank:
                thread_rank[th.author_id] += total
            else:
                thread_rank[th.author_id] = total
                    
        thread_rank = sorted(thread_rank.items(), key=lambda tup: tup[1], reverse=True) 
        my_thread_rank = next((i for i, v in enumerate(thread_rank) if v[0] == user), None)
        if my_thread_rank is not None:
            my_thread_rank = my_thread_rank + 1
            thread_rank_dict = dict(thread_rank)
            my_thread_points = thread_rank_dict[user]
            max_thread_points = thread_rank[0][1]
            total_thread_points = sum(x[1] for x in thread_rank)
            thread_list = [thread_rank, my_thread_rank, max_thread_points, my_thread_points, total_thread_points]
            
        else:
            thread_list = None
            
        
        #troll
        t_check = UserProfile.objects.get(user_id=request.user.id).troll_check
        
        troll_posts = t_check.strftime('%b %d, %-I:%M%p') if t_check else ""
        
        return render(request,'blog/status.html',{'user':int(user),
                                                'total_users': total_users,
                                                'user_rank': user_rank,
                                                'all_threads':all_threads,
                                                'thread_rank':thread_rank,
                                                'activity_list':activity_list,
                                                'thread_list':thread_list,
                                                'troll_posts': troll_posts,
                                                    })
    else:
        return render(request, 'blog/status.html', {})


def home(request):
    all_threads = Thread.objects.all()
    last_14_days = timezone.now() - timezone.timedelta(days=14)
    
    #delete old threads
    for at in all_threads:
        if at.published_date < last_14_days:
            at.delete()
        

    #default load before ajax reload JIC
    threads = all_threads.filter(published_date__lte=timezone.now()).order_by('-published_date')
    
    #main thread form
    form = ThreadForm()
    
    #main keyword loading to sidbar
    sorted_nouns = keyword_extends(request.user.id)
    
    return render(request, 'blog/home.html', {'sorted_nouns': sorted_nouns, 'threads': threads, 'form': form})


def thread_list(request):
    past_day = timezone.now() - timezone.timedelta(days=1)

    #if someone is logged in
    if request.user.id:
        kwargs = {}
        args = []
    
        if request.GET.get('start_end'):
            start_end = request.GET.get('start_end')
            start_end_list = start_end.split(',')
        
            start = start_end_list[0]
            end = start_end_list[1]
        
        else:
            start = 0
            end = 10
    
        #organize by popularity. i.e, most comments and most elf votes    
        if request.GET.get('pop') == "-resp_count":
            args.append(request.GET.get('pop'))
            args.append('-tcount')
            args.append('-rvcount')
        
        #search or keyword
        if request.GET.get('contains'):
            response_search = Response.objects.filter(text__icontains=request.GET.get('contains'))
            thread_search = Thread.objects.filter(text__icontains=request.GET.get('contains'))
            keyword_threads = []
            for t in thread_search:
                keyword_threads.append(t.pk)
            
            for r in response_search:
                keyword_threads.append(r.thread_id)
            
            kwargs['pk__in'] = keyword_threads
            #kwargs['text__icontains'] = request.GET.get('contains')
    
        #my likes
             
        if request.GET.get('faves'):
            #this is a fine method for now, but we need to figure out linkages between users.
            #this method just finds all the things you voted for
            #threads=threads.filter(Q(tvote__user_id=request.user.id) | Q(response__rvote__user_id=request.user.id))
            #
            #this method takes a new field in user profile that you can 
            fave_list = find_faves(request.user.id)
            
            kwargs[request.GET.get('faves')] = fave_list
              
        #my conversations        
        if request.GET.get('my'):
            kwargs[request.GET.get('my')] = request.user.id
     
        #order by when published               
        if request.GET.get('pub'):
    #         if not request.GET.get('pop'):
            args.append(request.GET.get('pub'))
        else:
    #         if not request.GET.get('pop'):
            args.append('-published_date')
        
        threads=Thread.objects.filter(published_date__gte=past_day).filter(**kwargs).order_by(*args)
    
        #check to see if user has posted any threads
        my_threads = Thread.objects.filter(author_id=request.user.id)
        if my_threads.count() > 0:
            curr_thread = my_threads.order_by("pk").reverse()[0]
            threads=threads.exclude(pk=curr_thread.id)
    
        #most popular
        if request.GET.get('pop') == "-resp_count":
            threads=threads.annotate(tcount=Count('tvote__post_id')).annotate(rvcount=Count('response__rvote__post_id'))
   
    
        threads=threads.distinct()[start:end]
        votes=TVote.objects.filter(user=request.user)
        choices=TVote.MY_CHOICES
        user=True
    
        return render(request,'blog/thread_list.html',{'threads':threads, 'votes':votes, 'choices':choices, 'user':user})
    
    else:
        user=False
        return render(request,'blog/thread_list.html',{'user':user})
 
      
def thread_detail(request, pk):
    t = get_object_or_404(Thread, pk=pk)
    response = Response.objects.filter(published_date__lte=timezone.now(), thread=t.pk).order_by('published_date')
    form = ResponseForm(initial={'thread' : t.pk})
    j=RVote.objects.filter(post=response)
    return render(request, 'blog/thread_detail.html', {'t': t, 'response': response, 'form': form, 'j': j})
 
    
def thread_detail_detail(request, pk):
    t = get_object_or_404(Thread, pk=pk)
    response = Response.objects.filter(published_date__lte=timezone.now(), thread=t.pk).order_by('published_date')
    user=request.user
    return render(request, 'blog/thread_detail_detail.html', {'t': t, 'response': response, 'user':user})

#guest user funtionality
from django.views.generic import RedirectView

def guest_user(request):
    random_string = get_random_string(length=16)
    username = 'guest_' + random_string
    email = random_string + "@ditl.me"
    password = random_string

    user = User.objects.create_user(username, email, password)
    user.save()
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        login(request, user)
        return HttpResponseRedirect('/')
    else:
        return HttpResponseRedirect('/')
    