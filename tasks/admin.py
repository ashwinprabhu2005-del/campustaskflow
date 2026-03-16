from django.contrib import admin
from .models import Task, Student, ProductivityLog, Category

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'due_date', 'is_completed')

admin.site.register(Student)
admin.site.register(ProductivityLog)
admin.site.register(Category)
