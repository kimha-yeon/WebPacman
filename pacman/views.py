from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from .models import Ranker
from .forms import Ranker_form

def index(request):
    messages.info(request, 'Your password has been changed successfully!')
    return render(request, 'pacman/index.html')

def show_ranking(request):
    ranker_list = Ranker.objects.order_by('-score')[:10]
    context = {
        'ranker_list': ranker_list,
    }
    return render(request, 'pacman/ranking.html', context)

def start_game(request):
    scores = Ranker.objects.order_by('-score')[:10]
    if len(scores) >= 10:
        limit_score = Ranker.objects.order_by('-score')[9:10]
        limit_score = limit_score[0].score
    else:
        print("else문")
        ranker_list = Ranker.objects.all()
        print(ranker_list, len(ranker_list)-1)
        limit_score = ranker_list[len(ranker_list)-1].score
    context = {
        'limit_score': limit_score
    }
    return render(request, 'pacman/game.html', context)

def add_ranking(request, score):
    ranker_list = Ranker.objects.all()
    if request.method == 'POST':
        form = Ranker_form(request.POST)
        if form.is_valid():
            ranker = form.save(commit=False)
            name_list = Ranker.objects.filter(name=request.POST['name'])
            if (len(name_list) > 0) :
                form = Ranker_form()
                context = {'form': form, 'score': score, 'ranker_list': ranker_list}
                return render(request, 'pacman/add_ranking.html', context)
            else:
                ranker.name = request.POST['name']
                ranker.score = score
                ranker.save()
                return redirect('show_ranking')
    else:
        form = Ranker_form()
    context = {'form': form, 'ranker_list': ranker_list}
    return render(request, 'pacman/add_ranking.html', context)
