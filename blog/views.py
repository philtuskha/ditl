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



def faves(vote_post_id, thread, add_subtract_faves, me):
    #storing favorite users to my profile, a.k.a. people's threads you respond to 
    faves = UserProfile.objects.get(user_id=me)
    
    if thread.id is not vote_post_id:
       
        if faves.favorites is None:
            fave_dict = {}
            fave_dict[thread.author_id] = add_subtract_faves
        
        else:
            fave_dict = json.loads(faves.favorites)
        
            if str(thread.author_id) in fave_dict:
                fave_dict[str(thread.author_id)] += add_subtract_faves
            else:
                fave_dict[thread.author_id] = add_subtract_faves
            
        faves.favorites = json.dumps(fave_dict)
        faves.save()
        
   
def vote(request):
    if request.method=="POST":
        
        #check whether the vote is for thread or response
        if request.POST.get('post_type') == "thread":
            tv=TVote.objects.all()
            form=TVoteForm(request.POST)
            old_vote = TVote.objects.filter(post=request.POST.get('post'), user=request.user)
            count = Thread.objects.get(id=request.POST.get('post'))
            
        elif request.POST.get('post_type') == "response":
            tv=RVote.objects.all()
            form=RVoteForm(request.POST)
            old_vote = RVote.objects.filter(post=request.POST.get('post'), user=request.user)
            count = Response.objects.get(id=request.POST.get('post'))
        
        
        if form.is_valid():
            #add or subtract from your favorites in UserProfile
            add_subtract_faves = 0    
        
            vote=form.save(commit=False)
            #checking to see if post has already been voted for, voting for or revoting thereafter
            if old_vote.count() > 0 and old_vote[0].option != request.POST.get('option'):
                old_vote.delete()
            
                vote.user=request.user
                vote.published_date=timezone.now()
                vote.save()
                
                #add or subtract from your favorites in UserProfile
                if request.POST.get('option') == "SE":
                    add_subtract_faves = 1
                else:
                    add_subtract_faves = -1
                
                faves(request.POST.get('post'), count, add_subtract_faves, request.user.id)
                
                data = {'option': request.POST.get('option'), 'post': request.POST.get('post'), 'deleted': False}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
            elif old_vote.count() > 0 and old_vote[0].option == request.POST.get('option'):
                old_vote.delete()
                
                count.vote_count = count.vote_count - 1
                count.save()
                
                #add or subtract from your favorites in UserProfile
                if request.POST.get('option') == "SE":
                    add_subtract_faves = -1
                else:
                    add_subtract_faves = 1
                
                faves(request.POST.get('post'), count, add_subtract_faves, request.user.id)
                
                
                data = {'option': request.POST.get('option'), 'post': request.POST.get('post'), 'deleted': True}
                return HttpResponse(json.dumps(data), content_type='application/json')  
                
            else:
                count.vote_count = count.vote_count + 1
                count.save()
            
                vote.user=request.user
                vote.published_date=timezone.now()
                vote.save()
                
                #add or subtract from your favorites in UserProfile
                if request.POST.get('option') == "SE":
                    add_subtract_faves = 1
                else:
                    add_subtract_faves = -1
                
                faves(request.POST.get('post'), count, add_subtract_faves, request.user.id)
                    
                data = {'option': request.POST.get('option'), 'post': request.POST.get('post'), 'deleted': False}
                return HttpResponse(json.dumps(data), content_type='application/json')
                
        else:
            #data = {'message': "%s and %s added" % (request.POST.get('option'), request.POST.get('post'))}
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
    
        #check whether the vote is for thread or response
        if request.POST.get('post_type') == "thread":
            delete_this = Thread.objects.filter(pk=request.POST.get('pk'), user=request.user)
            delete_this.delete()
            
            data = {'message': "%s and %s deleted" % (request.POST.get('title'), request.POST.get('text'))}
            return HttpResponse(json.dumps(data), content_type='application/json')
            
        elif request.POST.get('post_type') == "response":
            delete_this = Response.objects.filter(pk=request.POST.get('pk'), author=request.user)
            delete_this.delete()
            
            data = {'message': "%s response deleted" % request.POST.get('pk')}
            return HttpResponse(json.dumps(data), content_type='application/json')
        
        
    
def add_thread(request):
    #add thread or response
    if request.method == "POST" and request.is_ajax():
        user_thread = Thread.objects.filter(author_id=request.user.id)
    
        if user_thread.count() > 0:
            my_last_thread = user_thread.order_by("pk").reverse()[0]
            t = timezone.now() - my_last_thread.published_date
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
            
                #add last_thread date and time to user profile
                #lt, created = UserProfile.objects.update_or_create(user=request.user, defaults={'last_thread':timezone.now()})
            
                #add current thread from user
                #ct, created = UserProfile.objects.update_or_create(user=request.user, defaults={'curr_thread':thread.id}) 
                
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
                
                faves(request.POST.get('is_thread'), response.thread, 1, request.user.id)
                
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
        if table.objects.all().count() > 0:
            return_value = table.objects.all().order_by("pk").reverse()[0].id
        else:
            return_value = 0
    
    return return_value        
    
    
def update_page(request):
    # query on Posts, User View, Notifications, Status, Keywords(Trending) to see if database hase changed
    print return_last_id_from_table(request, Thread, 'last_thread')
    print "##########"
    last_thread = return_last_id_from_table(request, Thread, 'last_thread')
    last_response = return_last_id_from_table(request, Response, 'last_response')
    last_tvote = return_last_id_from_table(request, TVote, 'last_tvote')
    last_rvote = return_last_id_from_table(request, RVote, 'last_rvote')
    
    # if request.GET.get('last_thread'):
#         #if Threads or Responses or TVotes or RVotes are updated reload the main threads again
#         thread_count = Thread.objects.filter(id__gte=request.GET.get('last_thread')).count()
#         last_thread = request.GET.get('last_thread') + thread_count
#     else:
#         t = Thread.objects.all()
#         if(t.count() > 0)
#             last_thread = t.order_by("pk").reverse()[0].id
#         else:
#             last_thread = 0
#         
#     if request.GET.get('last_response'):   
#         response_count = Response.objects.filter(id__gte=request.GET.get('last_response')).count()
#         last_response = request.GET.get('last_response') + response_count
#     else:
#         last_response = Response.objects.all().order_by("pk").reverse()[0].id
#         t = Thread.objects.all()
#         if(t.count() > 0)
#             last_thread = t.order_by("pk").reverse()[0].id
#         else:
#             last_thread = 0
#     
#     if request.GET.get('last_tvote'):   
#         tvote_count = TVote.objects.filter(id__gte=request.GET.get('last_tvote')).count()
#         last_tvote = request.GET.get('last_tvote') + tvote_count
#     else:
#         last_tvote = TVote.objects.all().order_by("pk").reverse()[0].id
#       
#     if request.GET.get('last_rvote'):  
#         rvote_count = RVote.objects.filter(id__gte=request.GET.get('last_rvote')).count()
#         last_rvote = request.GET.get('last_rvote') + rvote_count
#     else:
#         last_rvote = RVote.objects.all().order_by("pk").reverse()[0].id
        
    
    #count responses to my last thread
    user_thread = Thread.objects.filter(author_id=request.user.id)
    #user_thread = Thread.objects.filter(author_id=request.user.id).order_by("pk").reverse()[0]
    
    if user_thread.count() > 0:
        my_last_thread = user_thread.order_by("pk").reverse()[0]
        my_thread_respo = Response.objects.filter(thread_id=my_last_thread.id)
        my_last_thread_responses = my_thread_respo.exclude(author_id=request.user.id).count()
        my_last_thread_tvote = TVote.objects.filter(post_id=my_last_thread.id).exclude(user_id=request.user.id).count()
        
        #you can do this better
        x = 0
        for r in my_thread_respo:
            x += RVote.objects.filter(post_id=r.id).exclude(user_id=request.user.id).count()
       
        my_last_thread_rvote = x

    else:
        my_last_thread_responses = 0
        my_last_thread_tvote = 0
        my_last_thread_rvote = 0
        
        
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
    return render(request,'blog/status.html',{'user':user, 'status':status, 'tvotes':tvotes, 'rvotes':rvotes, 'user_votes':user_votes, 'total_votes':total_votes})

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
