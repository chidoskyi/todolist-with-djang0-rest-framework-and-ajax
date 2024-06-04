from django.db import models

# Create your models here.


class Tasks(models.Model):
    title = models.CharField(max_length=150)
    completed = models.BooleanField(default=False)
    # date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return self.title
    
