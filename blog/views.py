import json
from django.shortcuts import render, get_object_or_404, render_to_response, redirect
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q, Count
from django.template.context import RequestContext
from django.http import Http404, HttpResponse
from .models import Thread, TVote, Response, RVote, UserProfile, User
from .forms import ThreadForm, TVoteForm, ResponseForm, RVoteForm
from django.contrib.auth.models import Permission
from nltk import sent_tokenize, word_tokenize, pos_tag
import ast


def activity(type, increment, date, me):
    profile_object = UserProfile.objects.get(user_id=me)
    
    if type is "thread":
        profile_object.activity_threads += increment
        profile_object.last_thread = date
        
    elif type is "response":
        profile_object.activity_responses += increment
        profile_object.last_response = date
        
    elif type is "vote":
        profile_object.activity_votes += increment
        profile_object.last_vote = date
    
        
    profile_object.save()
    


def faves(type, vote_post_id, thread, add_subtract_faves, me):
    #storing favorite users to my profile, a.k.a. people's threads you respond to 
    fave_object = UserProfile.objects.get(user_id=me)
    
    if thread.id is not vote_post_id:
       
        if fave_object.favorites is None:
            fave_dict = {}
            fave_array = []
            
            if type is "vote":
                fave_array.append(add_subtract_faves)
                fave_array.append(0)
                
                fave_dict[thread.author_id] = fave_array
            else:
                fave_array.append(0)
                fave_array.append(add_subtract_faves)
                
                fave_dict[thread.author_id] = fave_array
        
        else:
            fave_dict = json.loads(fave_object.favorites)
            
            if str(thread.author_id) in fave_dict:
                if type is "vote":
                    fave_dict[str(thread.author_id)][0] += add_subtract_faves
                else:
                    fave_dict[str(thread.author_id)][1] += add_subtract_faves
                    
            else:
                fave_array = []
                
                if type is "vote":
                    fave_array.append(add_subtract_faves)
                    fave_array.append(0)
                
                    fave_dict[thread.author_id] = fave_array
                else:
                    fave_array.append(0)
                    fave_array.append(add_subtract_faves)
                
                    fave_dict[thread.author_id] = fave_array
            
        fave_object.favorites = json.dumps(fave_dict)
        fave_object.save()
        

def post_status(post_object, type, post_id):

    if type == "thread":
        troll_votes = TVote.objects.filter(post=post_id, option="TR")
        
    elif type == "response":
        troll_votes = RVote.objects.filter(post=post_id, option="TR")
    
    
    if troll_votes.count() >= 2:
        post_object.is_active = 2
        post_object.save()
    else:
        post_object.is_active = 0
        post_object.save()
        

def vote(request):
    if request.method=="POST":
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

            def troll_vote_status(user_thread_votes, user_respo_votes):
                thread_vote_count = user_thread_votes.filter(option="TR").count()
                respo_vote_count = user_respo_votes.filter(option="TR").count()
    
                vote_count = thread_vote_count + respo_vote_count
    
                if vote_count is 6:
                    #send WARNING notification message to notification center
                    return ("warning", """Whoa, pump the brakes there, Troll Hunter.  
                                            You can only have six troll votes at any given time.  
                                            One more troll vote, and you will have your troll voting privileges revoked. """)
        
                elif vote_count > 6:
                    #send RESTRICTED notification message to notification center
                    return ("restricted", """Troll Hunter.  
                                            Your troll voting is now restricted. 
                                            You can still vote positively, but we don't allow vigilante troll hunting.
                                            Delete some of your troll votes.
                                            Or, just wait until tomorrow.""")
                                        
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
                    
                t_check, message = troll_vote_status(user_thread_votes, user_respo_votes)
                
                
                
                faves("vote", request.POST.get('post'), post_object, add_subtract_faves, request.user.id)
                activity("vote", num, timezone.now(), request.user.id)
                
                data = {'option': request.POST.get('option'), 'post': request.POST.get('post'), 'num': num, 't_check': t_check, 'message': message}
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
        tv=TVote.objects.all()
        form=TVoteForm()
        return render(request,'blog/vote.html',{'tv':tv,'form':form})
        
   
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


def delete_post(request):
    if request.method=="POST" and request.is_ajax():
        respos_to_thread = Response.objects.filter(thread_id=request.POST.get('thread_id'))
        
        #check whether the delete is for thread or response
        if request.POST.get('post_type') == "thread":
            delete_this = Thread.objects.get(pk=request.POST.get('pk'), author=request.user)
            print respos_to_thread.count()
            
            if respos_to_thread.count() == 0:
                delete_this.delete()
            
                activity("thread", -1, timezone.now(), request.user.id)
                
                delete_or_hide = "delete"
                
            else:
                delete_this.is_active = 1
                delete_this.save()
                
                delete_or_hide = "hide"
            
                
    
        elif request.POST.get('post_type') == "response":
            last_response = respos_to_thread.order_by("pk").reverse()[0]
            last_response_id = last_response.id
            
            if last_response_id == int(request.POST.get('pk')):
                delete_this = respos_to_thread.filter(pk=request.POST.get('pk'), author=request.user)
                delete_this.delete()
            
                activity("response", -1, timezone.now(), request.user.id)
                
                delete_or_hide = "delete"
                
            else:
                hide_this = respos_to_thread.get(pk=request.POST.get('pk'), author=request.user)
                hide_this.is_active = 1
                hide_this.save()
                
                delete_or_hide = "hide"

            
        data = {'delete_or_hide': delete_or_hide}
        return HttpResponse(json.dumps(data), content_type='application/json')
        
        
    
def add_thread(request):
    #add thread or response
    if request.method == "POST" and request.is_ajax():
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
                
                activity("thread", 1, timezone.now(), request.user.id)
                
                data = {'message': "%s and %s added" % (request.POST.get('title'), request.POST.get('text'))}
                return HttpResponse(json.dumps(data), content_type='application/json')
            
            
            elif form.is_valid() and time_check == False:
                curr_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
            
                response = form.save(commit=False)
                response.thread = curr_thread #Thread.objects.get(pk=request.user.profile.curr_thread)
                response.author = request.user
                response.published_date = timezone.now()
                response.save()
                
                curr_count = curr_thread #Thread.objects.get(pk=request.user.profile.curr_thread) # .values_list('resp_count', flat=True)
                curr_count.resp_count = curr_count.resp_count + 1
                curr_count.save() 
                
                activity("response", 1, timezone.now(), request.user.id)
                
                data = {"message": "thanks"}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
        
        else:
            if form.is_valid():
                response = form.save(commit=False)
                response.thread = Thread.objects.get(pk=request.POST.get('is_thread'))
                response.author = request.user
                response.published_date = timezone.now()
                response.save()
                
                curr_count = Thread.objects.get(pk=request.POST.get('is_thread')) # .values_list('resp_count', flat=True)
                curr_count.resp_count = Response.objects.filter(thread=request.POST.get('is_thread')).count()
                curr_count.save() 
                
                faves("response", request.POST.get('is_thread'), response.thread, 1, request.user.id)
                activity("response", 1, timezone.now(), request.user.id)
                
                data = {"message": "thanks"}
                return HttpResponse(json.dumps(data), content_type='application/json')
            
    else:
        form = ThreadForm()
    return render(request, 'blog/thread_edit.html', {'form': form})
    
 
def user_view(request):
    if request.user.id:
        my_threads = Thread.objects.filter(author_id=request.user.id)
        
        if my_threads.count() > 0:
            curr_thread = my_threads.order_by("pk").reverse()[0]
        
            diff = timezone.now() - curr_thread.published_date
            timediff = diff.total_seconds()
            timediff = (timediff/86400) * 49.9
    
            respo = Response.objects.filter(published_date__lte=timezone.now(), thread=curr_thread.id).order_by('published_date')
        else:
            timediff = 0
            curr_thread = 0
            respo = []
            
        user=request.user
        return render(request, 'blog/user_view.html', {'curr_thread_id': curr_thread.id, 'curr_thread': curr_thread, 'user': user, 'respo': respo, 'timediff': timediff })
    else:
        return render(request, 'blog/user_view.html', {})


def return_last_id_from_table(request, table, value):
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
    
    
def update_page(request):
    # query on Posts, User View, Notifications, Status, Keywords(Trending) to see if database hase changed
    
    last_thread = return_last_id_from_table(request, Thread, 'last_thread')
    last_response = return_last_id_from_table(request, Response, 'last_response')
    last_tvote = return_last_id_from_table(request, TVote, 'last_tvote')
    last_rvote = return_last_id_from_table(request, RVote, 'last_rvote')
    
    try:
        my_last_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
    except (IndexError, ValueError):
        my_last_thread_responses = 0
        my_last_thread_tvote = 0
        my_last_thread_rvote = 0
    
    else:
        my_thread_respo = Response.objects.filter(thread_id=my_last_thread.id)
        my_last_thread_responses = my_thread_respo.exclude(author_id=request.user.id).count()
        my_last_thread_tvote = TVote.objects.filter(post_id=my_last_thread.id).exclude(user_id=request.user.id).count()
        
        #you can do this better
        x = 0
        for r in my_thread_respo:
            x += RVote.objects.filter(post_id=r.id).exclude(user_id=request.user.id).count()
       
        my_last_thread_rvote = x
        
    # count responses to my last thread
#     user_thread = Thread.objects.filter(author_id=request.user.id)
#     user_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
#     
#     if user_thread.count() > 0:
#         my_last_thread = user_thread.order_by("pk").reverse()[0]
#         my_thread_respo = Response.objects.filter(thread_id=my_last_thread.id)
#         my_last_thread_responses = my_thread_respo.exclude(author_id=request.user.id).count()
#         my_last_thread_tvote = TVote.objects.filter(post_id=my_last_thread.id).exclude(user_id=request.user.id).count()
#         
#         you can do this better
#         x = 0
#         for r in my_thread_respo:
#             x += RVote.objects.filter(post_id=r.id).exclude(user_id=request.user.id).count()
#        
#         my_last_thread_rvote = x
# 
#     else:
#         my_last_thread_responses = 0
#         my_last_thread_tvote = 0
#         my_last_thread_rvote = 0
        
        
    diff = timezone.now() - my_last_thread.published_date
    timediff = diff.total_seconds()
    timediff = (timediff/86400) * 49.9
        
      
    data = {'last_thread': last_thread, 'last_response': last_response, 'last_tvote': last_tvote, 'last_rvote': last_rvote, 'my_last_thread_responses': my_last_thread_responses, 'my_last_thread_tvote': my_last_thread_tvote, 'my_last_thread_rvote': my_last_thread_rvote, 'timediff': timediff}
    return HttpResponse(json.dumps(data), content_type='application/json')
        

def profile_test(request):
    # diff = timezone.now() - request.user.profile.last_thread
#   timediff = diff.total_seconds()
#   timediff = (timediff/86400) * 49.9
    
    timediff = 49.9
    
    curr_thread_id = request.user.profile.curr_thread
    curr_thread = get_object_or_404(Thread, pk=curr_thread_id)
    respo = Response.objects.filter(published_date__lte=timezone.now(), thread=curr_thread_id).order_by('published_date')
    
    user=request.user
    
    profile=request.user.profile.user_id
    
    last_thread=request.user.profile.last_thread
    
    other=request.user.profile.curr_thread
    
    request.user.profile.last_thread=timezone.now()
    
    
    return render(request, 'blog/profile_test.html', {'user': user, 'profile': profile, 'last_thread': last_thread, 'other': other, 'timediff': timediff })


def keyword_extends():
#   if I want to add keyword searches from responses as well    
#   response = Response.objects.all()
#   all_text = [response, thread]
    thread = Thread.objects.all()
    most_used_nouns = {}
    nouns = ['NN', 'NNP', 'NNS', 'NNPS']
    pre = ['JJ', 'JJR', 'JJS', '#', 'UH', 'VB', 'VBD', 'VBG', 'VBN', 'PRP$', 'RB']
    
#   for all in all_text:
    for r in thread:
        tokens = word_tokenize(r.text)
        tagged = pos_tag(tokens)
    
        last_word = ""
    
        for t in range(0, len(tagged)):
            word, type = tagged[t]
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
    
    sorted_nouns = sorted(most_used_nouns.items(), key=lambda x: x[1], reverse=True)
    return sorted_nouns

    
def keywords(request):  

    sorted_nouns = keyword_extends()        
    return render(request,'blog/keywords.html',{'sorted_nouns':sorted_nouns,'timediff':timediff})

def notifications(request):
    user = request.user
    return render(request,'blog/notifications.html',{'user':user})

    
def status(request):
    
    t_status = 0
    t_total_votes = 0.0
    t_options=(('TR',-2),('SE',6))
    
    tvotes = {}
    for ts in t_options:
         tvotes[ts[0]] = TVote.objects.filter(post__author=request.user, option=ts[0]).exclude(user=request.user).count() 
         
         if ts[0] is not 'TR':
            t_status += (tvotes[ts[0]] * ts[1])
            t_total_votes += tvotes[ts[0]] * 6
         else:
#           pass #do troll vote stuff here
            t_status += (tvotes[ts[0]] * ts[1])
            t_total_votes += tvotes[ts[0]] * 6
            
    
    r_status = 0
    r_total_votes = 0.0
    r_options=(('TR',-2),('SE',3))
    
    rvotes = {}
    for rs in r_options:
         rvotes[rs[0]] = RVote.objects.filter(post__author=request.user, option=rs[0]).count()
         
         if rs[0] is not 'TR':
            r_status += (rvotes[rs[0]] * rs[1])
            r_total_votes += rvotes[rs[0]] * 3
         else:
#           pass #do troll vote stuff here
            r_status += (rvotes[rs[0]] * rs[1])
            r_total_votes += rvotes[rs[0]] * 3
            
    if t_total_votes and r_total_votes:
        status =  ((t_status/t_total_votes) + (r_status/r_total_votes)) / 2
    elif t_total_votes and  not r_total_votes:
        status =  (t_status/t_total_votes)
    elif not t_total_votes and r_total_votes:
        status =  (r_status/r_total_votes)
    else:
        #user has not recieved any votes
        status = 0
    
    #users votes. factoring in participation into algorithm 
    time_from = datetime.now() - timedelta(hours=24.0)
    
    total_votes = 0
    user_votes = {}
    for i in TVote.MY_CHOICES:
         t_count = TVote.objects.filter(user=request.user, option=i[0], published_date__gte=time_from).count()
         r_count = RVote.objects.filter(user=request.user, option=i[0], published_date__gte=time_from).count()
         user_votes[i[0]] = t_count + r_count
         total_votes = total_votes + t_count + r_count
    
    
    profile = UserProfile.objects.all()
    
    fave_votes = 0
    fave_respo = 0
    for p in profile:
        
        if p.favorites:
            fave_dict = json.loads(p.favorites)
             
            for user, val in fave_dict.items(): 
                if int(user) == request.user.id:
                     fave_votes += val[0]
                     fave_respo += val[1]
    
    favorited = "you recieved %s votes and %s responses" % (fave_votes, fave_respo)
        
    
    
    #adding total_votes * .001 to status to encourage voting
    status = status + (0.001 * total_votes)
    
    days_responses = Response.objects.filter(author=request.user, published_date__gte=time_from).count() #, published_date__gte=time_from
    
    #adding days_responses * .008 to status to encourage responding to threads
    status = status + (0.008 * days_responses)
    
    days_thread = Thread.objects.filter(author=request.user, published_date__gte=time_from).count() #, published_date__gte=time_from
    
    #adding days_thread * .01 to status to encourage initiating thread
    status = status + (0.1 * days_thread)
    
    status = round(status, 2)
    
    user=request.user
        
        
#   user_votes = TVote.objects.filter(user=request.user, option="DL").count()
#   user_votes = TVote.objects.all()
    return render(request,'blog/status.html',{'user':user, 'status':status, 'favorited':favorited, 'tvotes':tvotes, 'rvotes':rvotes, 'user_votes':user_votes, 'total_votes':total_votes})

def home(request):
    #default load before ajax reload JIC
    threads = Thread.objects.filter(published_date__lte=timezone.now()).order_by('-published_date')
    
    #main thread form
    form = ThreadForm()
    
    #main keyword loading to sidbar
    sorted_nouns = keyword_extends()
    
    return render(request, 'blog/home.html', {'sorted_nouns': sorted_nouns, 'threads': threads, 'form': form})


    
def thread_list(request):
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
            kwargs['text__icontains'] = request.GET.get('contains')
    
        #my likes
             
        if request.GET.get('faves'):
            #this is a fine method for now, but we need to figure out linkages between users.
            #this method just finds all the things you voted for
            #threads=threads.filter(Q(tvote__user_id=request.user.id) | Q(response__rvote__user_id=request.user.id))
            #
            #this method takes a new field in user profile that you can 
            
            my_faves = UserProfile.objects.get(user_id=request.user.id).favorites
            
            if my_faves: 
                fave_dict = json.loads(my_faves)
                fave_list_tuples = sorted(fave_dict.items(), key=lambda x: x[1], reverse=False)
                fave_list = []
                for x in fave_list_tuples:
                    if x[1] > 0:
                        fave_list.append(x[0])
            
                kwargs[request.GET.get('faves')] = fave_list
                
            else:
                kwargs[request.GET.get('faves')] = [0] #filter by a non user
                
                
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
        
        threads=Thread.objects.filter(published_date__lte=timezone.now()).filter(**kwargs).order_by(*args)
    
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
