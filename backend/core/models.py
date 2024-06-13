from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Tasks(models.Model):
    title = models.CharField(max_length=150)
    completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', null=True)
    # date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return self.title
    

class Reaction(models.Model):
    LIKE = '👍'
    LOVE = '❤️'
    HAHA = '😂'
    SAD = '😢'
    ANGRY = '😠'
    REACTION_CHOICES = [
        (LIKE, 'Like'),
        (LOVE, 'Love'),
        (HAHA, 'Haha'),
        (SAD, 'Sad'),
        (ANGRY, 'Angry'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Tasks, related_name='reactions', on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'task', 'reaction_type']  # Ensure each user can only have one reaction of each type per task

    def __str__(self):
        return f'{self.user.username} reacted with {self.reaction_type}'
    
