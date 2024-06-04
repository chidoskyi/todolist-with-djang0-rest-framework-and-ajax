from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializer import TaskSerializer
from core.models import Tasks
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework import status

@api_view(['GET'])
def getTodos(request):
    tasks = Tasks.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getTodo(request, pk):
    task = Tasks.objects.get(id=pk)
    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def createTodo(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'POST'])
def updateTodo(request, pk):
    task = Tasks.objects.get(id=pk)
    serializer = TaskSerializer(instance=task, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def deleteTodo(request, pk):
    task = Tasks.objects.get(id=pk)
    serializer = TaskSerializer(instance=task, data=request.data)
    task.delete()
    return Response('Todo deleted successfully')


@csrf_exempt
def complete_task(request, id):
    if request.method == 'POST':
        try:
            task = Tasks.objects.get(pk=id)
            completed = request.POST.get('check') == 'true'  # Get the checkbox state from POST data
            # task.completed = not task.completed  # Toggle the completed status
            task.completed = completed  # Set the completed status
            task.save()
            return JsonResponse({'status': 'success', 'completed': task.completed})
        except Tasks.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Task not found'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)


