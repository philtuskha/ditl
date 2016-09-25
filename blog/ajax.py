import json
from django.http import Http404, HttpResponse

def add_thread(request):
    if request.is_ajax() and request.POST:
        data = {'message': "%s and %s added" % (request.POST.get('title'), request.POST.get('text'))}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        raise Http404
        
# def thread_new(request):
#     if request.method == "POST":
#         form = ThreadForm(request.POST)
#         if form.is_valid():
#             thread = form.save(commit=False)
#             thread.author = request.user
#             thread.published_date = timezone.now()
#             thread.save()
#             return redirect('thread_detail', pk=thread.pk)
#     else:
#         form = ThreadForm()
#     return render(request, 'blog/thread_edit.html', {'form': form})
