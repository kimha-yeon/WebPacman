from django.db import models

class Ranker(models.Model):
    name = models.CharField(max_length=12)
    score = models.IntegerField()
    datetime = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'ranker'
