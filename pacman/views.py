from django.shortcuts import render, get_object_or_404, redirect
from .models import Ranker
from .forms import Ranker_form

def index(request):
    return render(request, 'pacman/index.html')

def show_ranking(request):
    ranker_list = Ranker.objects.order_by('-score')[:10]
    context = {
        'ranker_list': ranker_list,
    }
    return render(request, 'pacman/ranking.html', context)

def start_game(request):
    limit_score = Ranker.objects.order_by('-score')[9:10]
    limit_score = limit_score[0].score
    context = {
        'limit_score': limit_score
    }
    return render(request, 'pacman/game.html', context)

def add_ranking(request, score):
    if request.method == 'POST':
        form = Ranker_form(request.POST)
        if form.is_valid():
            ranker = form.save(commit=False)
            ranker.name = request.POST['name']
            ranker.score = score
            ranker.save()
            return redirect('show_ranking')
    else:
        form = Ranker_form()
    context = {'form': form}
    return render(request, 'pacman/add_ranking.html', context)

