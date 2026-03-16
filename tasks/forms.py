from django import forms
from .models import Task, Student

class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        exclude = ['created_at', 'owner']
        widgets = {
            'due_date': forms.DateInput(attrs={'type': 'date'}),
            'completion_date': forms.DateInput(attrs={'type': 'date'}),
        }

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        exclude = ['created_at']
