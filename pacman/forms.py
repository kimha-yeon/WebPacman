from django import forms
from .models import Ranker

class Ranker_form(forms.ModelForm):
    class Meta:
        model = Ranker
        fields = (
            'name',
        )
        widgets = {
            'name' : forms.TextInput(attrs={'style': 'max-width: 300px;'}),
        }
        labels = {
            'name' : '이름 ',
        }