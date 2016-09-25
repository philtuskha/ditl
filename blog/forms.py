from django import forms

from .models import Thread, TVote, Response, RVote
from django.core.exceptions import ValidationError, NON_FIELD_ERRORS

class ThreadForm(forms.ModelForm):

    class Meta:
        model = Thread
        fields = ('title', 'text', 'is_thread',)
        labels = {
            'title': "",
            'text': "",
            'is_thread':""
        }
        widgets = {'title': forms.HiddenInput(), 'is_thread':forms.HiddenInput()}
        
class ResponseForm(forms.ModelForm):

    class Meta:
        model = Response
        fields = ('title', 'text', 'is_thread',)
        labels = {
            'title': "",
            'text': "",
            'is_thread': ""
        }
        widgets = {'title': forms.HiddenInput(), 'is_thread':forms.HiddenInput()}
        
class TVoteForm(forms.ModelForm):

    class Meta:
        model = TVote
        fields = ('post', 'option')
        

class RVoteForm(forms.ModelForm):

    class Meta:
        model = RVote
        fields = ('post', 'option')
