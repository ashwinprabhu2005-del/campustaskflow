from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from tasks.models import Task
from datetime import timedelta

class Command(BaseCommand):
    help = 'Sends email reminders for tasks due within 24 hours'

    def handle(self, *args, **options):
        now = timezone.now().date()
        tomorrow = now + timedelta(days=1)
        
        # Find tasks due tomorrow that are not completed
        tasks_due_soon = Task.objects.filter(
            due_date=tomorrow,
            is_completed=False,
            owner__email__isnull=False
        )
        
        count = 0
        for task in tasks_due_soon:
            if task.owner.email:
                subject = f"Task Reminder Notification: {task.title}"
                message = f"""
Hello {task.owner.username},

This is a reminder that your task is due soon.

Task Name: {task.title}
Due Date: {task.due_date}
Priority: {task.priority}

Please log in to CampusTaskFlow to view and manage your tasks.
"""
                send_mail(
                    subject,
                    message,
                    'noreply@campustaskflow.com',
                    [task.owner.email],
                    fail_silently=False,
                )
                count += 1
                
        self.stdout.write(self.style.SUCCESS(f'Successfully sent {count} task reminders.'))
