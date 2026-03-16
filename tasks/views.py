from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.mail import send_mail
from django.urls import reverse
from .models import Task, Student, ProductivityLog, Category, EmailVerificationToken
from .forms import TaskForm, StudentForm

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False # Deactivate user until email is verified
            user.save()
            
            # Create token
            verification = EmailVerificationToken.objects.create(user=user)
            verification_link = request.build_absolute_uri(reverse('verify_email', args=[str(verification.token)]))
            
            # Send Email
            subject = 'Verify Your Account - CampusTaskFlow'
            message = f'''Hello {user.username},

Please click the link below to verify your account:
{verification_link}

Thank you for choosing CampusTaskFlow!
'''
            send_mail(subject, message, 'noreply@campustaskflow.com', [user.email], fail_silently=False)
            
            return render(request, 'register.html', {'form': form, 'verification_sent': True})
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

def verify_email_view(request, token):
    try:
        verification = EmailVerificationToken.objects.get(token=token)
        user = verification.user
        user.is_active = True
        user.save()
        verification.delete()
        return render(request, 'login.html', {'verification_success': True, 'form': AuthenticationForm()})
    except EmailVerificationToken.DoesNotExist:
        return render(request, 'login.html', {'verification_failed': True, 'form': AuthenticationForm()})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def profile_view(request):
    return render(request, 'profile.html', {'user': request.user})

def home_view(request):
    return render(request, 'home.html')

@login_required
def task_list_view(request):
    category_id = request.GET.get('category_id')
    tasks = Task.objects.filter(owner=request.user)
    
    if category_id:
        tasks = tasks.filter(category_id=category_id)
        
    categories = Category.objects.all()
    return render(request, 'task_list.html', {'tasks': tasks, 'categories': categories, 'selected_category': category_id})

@login_required
def add_task_view(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.save(commit=False)
            task.owner = request.user
            task.save()
            return redirect('task_list')
    else:
        form = TaskForm()
    return render(request, 'add_task.html', {'form': form})

@login_required
def task_detail_view(request, id):
    task = get_object_or_404(Task, id=id, owner=request.user)
    return render(request, 'task_detail.html', {'task': task})

@login_required
def complete_task_view(request, id):
    task = get_object_or_404(Task, id=id, owner=request.user)
    task.is_completed = True
    task.completion_date = timezone.now().date()
    task.save()
    
    # Log productivity
    ProductivityLog.objects.create(
        task=task,
        date=timezone.now().date(),
        status=True,
        notes="Task completed."
    )
    return redirect('task_list')

@login_required
def dashboard_view(request):
    tasks = Task.objects.filter(owner=request.user)
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(is_completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    high_priority_tasks = tasks.filter(priority='High').count()
    
    context = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'high_priority_tasks': high_priority_tasks,
    }
    return render(request, 'dashboard.html', context)

@login_required
def analytics_dashboard_view(request):
    tasks = Task.objects.filter(owner=request.user)
    
    # Summary stats
    total_tasks = tasks.count()
    completed_tasks = tasks.filter(is_completed=True).count()
    pending_tasks = total_tasks - completed_tasks
    high_priority_tasks = tasks.filter(priority='High').count()
    
    # Weekly completion data (mockup of past 7 days, normally would group by completion_date)
    # Since we don't have extensive historical data easily queryable without raw SQL or TruncDate
    # We will build a simple array for the last 7 days.
    from django.utils.timezone import timedelta
    today = timezone.now().date()
    labels = []
    data = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = tasks.filter(is_completed=True, completion_date=day).count()
        labels.append(day.strftime("%a"))
        data.append(count)
        
    context = {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'high_priority_tasks': high_priority_tasks,
        
        # Chart data
        'status_labels': ['Completed', 'Pending'],
        'status_data': [completed_tasks, pending_tasks],
        
        'weekly_labels': labels,
        'weekly_data': data,
    }
    return render(request, 'analytics.html', context)
