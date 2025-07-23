import re
import json
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from pymongo import MongoClient
from bson import ObjectId
import os
import base64
import google.generativeai as genai

# MongoDB Configuration
MONGO_URI = "mongodb+srv://Jai:Jai07ihub@cluster0.k4pik.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['event_management']
admin_collection = db['admins']
user_collection = db['users']
event_collection = db['events']

genai.configure(api_key="AIzaSyCmR5my83iF_ASIQVbc0_tTJ23OVxDyIwo")
model = genai.GenerativeModel("gemini-2.0-flash")
# Validators
def validate_name(name):
    if not name.replace(" ", "").isalpha():
        return "Name must contain only alphabetic characters and spaces"
    return None

def validate_email_unique(email, collection):
    try:
        validate_email(email)
        if collection.find_one({"email": email}):
            return "Email already exists"
    except ValidationError:
        return "Email is not valid"
    return None

def validate_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return "Password must contain at least one special character"
    return None

def check_account_status(email, collection):
    user = collection.find_one({'email': email})
    if user and user.get('login_attempts', 0) >= 3:
        return True
    return False

def increment_login_attempts(email, collection):
    user = collection.find_one({'email': email})
    attempts = user.get('login_attempts', 0) + 1 if user else 0
    account_deactivated = attempts >= 3
    if user:
        collection.update_one(
            {'email': email},
            {'$set': {'login_attempts': attempts}}
        )
    return attempts, account_deactivated

def reset_login_attempts(email, collection):
    collection.update_one(
        {'email': email},
        {'$set': {'login_attempts': 0}}
    )

def log_user_login(user_id, email, role):
    print(f"{role} login - ID: {user_id}, Email: {email}")

def validate_image_format(image):
    """Validates the uploaded image format (accepts JPEG, PNG, GIF)."""
    if image is None:
        return "Image is required"
    valid_mime_types = ['image/jpeg', 'image/png', 'image/gif']
    if hasattr(image, 'content_type'):
        if image.content_type not in valid_mime_types:
            return "Invalid image format. Only JPEG, PNG, and GIF are allowed."
    else:
        # Fallback: check file extension
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        filename = getattr(image, 'name', '')
        if not any(filename.lower().endswith(ext) for ext in valid_extensions):
            return "Invalid image format. Only JPEG, PNG, and GIF are allowed."
    return None

@csrf_exempt
def admin_register(request):
    """Registers a new admin user."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')

            if not all([name, email, password, confirm_password]):
                return JsonResponse({'error': 'All fields are required'}, status=400)

            # Validate name
            name_error = validate_name(name)
            if name_error:
                return JsonResponse({'error': name_error}, status=400)

            # Validate email
            email_error = validate_email_unique(email, admin_collection)
            if email_error:
                return JsonResponse({'error': email_error}, status=400)

            # Validate password
            password_error = validate_password(password)
            if password_error:
                return JsonResponse({'error': password_error}, status=400)

            # Validate confirm password
            if password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)

            hashed_password = make_password(password)

            admin_data = {
                'name': name,
                'email': email,
                'password': hashed_password,
                'role': 'admin',
                'status': 'Active',
                'created_at': datetime.now(),
                'last_login': None,
                'login_attempts': 0
            }
            result = admin_collection.insert_one(admin_data)
            admin_data['_id'] = str(result.inserted_id)

            # Generate JWT token without user object
            refresh = RefreshToken()
            refresh['email'] = admin_data['email']
            refresh['role'] = 'admin'
            refresh['id'] = admin_data['_id']

            log_user_login(admin_data['_id'], email, 'Admin')

            return JsonResponse({
                'message': 'Admin registered successfully',
                'jwt': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                },
                'last_login': None,
                'email': email,
                'redirect': '/create-event'
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def admin_login(request):
    """Authenticates an admin user and generates a JWT token."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            remember_me = data.get('rememberMe', False)

            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)

            if not password:
                return JsonResponse({'error': 'Password is required'}, status=400)

            if check_account_status(email, admin_collection):
                return JsonResponse(
                    {'error': 'Account has been deactivated due to too many failed login attempts. Contact the administrator.'},
                    status=403)

            admin = admin_collection.find_one({'email': email})
            if not admin:
                return JsonResponse(
                    {'error': f'Invalid email. No account found with email: {email}'}, status=401)

            if admin.get('status') != 'Active':
                return JsonResponse(
                    {'error': 'Account is inactive. Contact the administrator.'}, status=403)

            if not admin.get('password') or not admin.get('email'):
                return JsonResponse(
                    {'error': 'Invalid admin data'}, status=500)

            if not check_password(password, admin['password']):
                attempts, account_deactivated = increment_login_attempts(email, admin_collection)
                if account_deactivated:
                    return JsonResponse(
                        {'error': 'Account has been deactivated due to too many failed attempts. Contact the administrator.'},
                        status=403)
                return JsonResponse(
                    {'error': f'Invalid password. {3 - attempts} attempts remaining before account deactivation'},
                    status=401)

            reset_login_attempts(email, admin_collection)

            # Generate JWT token without user object
            refresh = RefreshToken()
            refresh['email'] = admin['email']
            refresh['role'] = 'admin'
            refresh['id'] = str(admin['_id'])

            admin_collection.update_one(
                {'_id': admin['_id']},
                {'$set': {'last_login': datetime.now()}}
            )

            log_user_login(admin['_id'], email, 'Admin')

            return JsonResponse({
                'message': 'Logged in successfully',
                'jwt': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                },
                'last_login': datetime.now().isoformat(),
                'email': email,
                'redirect': '/create-event'
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def user_register(request):
    """Registers a new user."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')

            if not all([name, email, password, confirm_password]):
                return JsonResponse({'error': 'All fields are required'}, status=400)

            # Validate name
            name_error = validate_name(name)
            if name_error:
                return JsonResponse({'error': name_error}, status=400)

            # Validate email
            email_error = validate_email_unique(email, user_collection)
            if email_error:
                return JsonResponse({'error': email_error}, status=400)

            # Validate password
            password_error = validate_password(password)
            if password_error:
                return JsonResponse({'error': password_error}, status=400)

            # Validate confirm password
            if password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)

            hashed_password = make_password(password)

            user_data = {
                'name': name,
                'email': email,
                'password': hashed_password,
                'role': 'user',
                'status': 'Active',
                'created_at': datetime.now(),
                'last_login': None,
                'login_attempts': 0
            }
            result = user_collection.insert_one(user_data)
            user_data['_id'] = str(result.inserted_id)

            # Generate JWT token without user object
            refresh = RefreshToken()
            refresh['email'] = user_data['email']
            refresh['role'] = 'user'
            refresh['id'] = user_data['_id']

            log_user_login(user_data['_id'], email, 'User')

            return JsonResponse({
                'message': 'User registered successfully',
                'jwt': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                },
                'last_login': None,
                'email': email,
                'redirect': '/events'
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def user_login(request):
    """Authenticates a user and generates a JWT token."""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            remember_me = data.get('rememberMe', False)

            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)

            if not password:
                return JsonResponse({'error': 'Password is required'}, status=400)

            if check_account_status(email, user_collection):
                return JsonResponse(
                    {'error': 'Account has been deactivated due to too many failed login attempts. Contact the administrator.'},
                    status=403)

            user = user_collection.find_one({'email': email})
            if not user:
                return JsonResponse(
                    {'error': f'Invalid email. No account found with email: {email}'}, status=401)

            if user.get('status') != 'Active':
                return JsonResponse(
                    {'error': 'Account is inactive. Contact the administrator.'}, status=403)

            if not user.get('password') or not user.get('email'):
                return JsonResponse(
                    {'error': 'Invalid user data'}, status=500)

            if not check_password(password, user['password']):
                attempts, account_deactivated = increment_login_attempts(email, user_collection)
                if account_deactivated:
                    return JsonResponse(
                        {'error': 'Account has been deactivated due to too many failed attempts. Contact the administrator.'},
                        status=403)
                return JsonResponse(
                    {'error': f'Invalid password. {3 - attempts} attempts remaining before account deactivation'},
                    status=401)

            reset_login_attempts(email, user_collection)

            # Generate JWT token without user object
            refresh = RefreshToken()
            refresh['email'] = user['email']
            refresh['role'] = 'user'
            refresh['id'] = str(user['_id'])

            user_collection.update_one(
                {'_id': user['_id']},
                {'$set': {'last_login': datetime.now()}}
            )

            log_user_login(user['_id'], email, 'User')

            return JsonResponse({
                'message': 'Logged in successfully',
                'jwt': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                },
                'last_login': datetime.now().isoformat(),
                'email': email,
                'redirect': '/events'
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def create_event(request):
    """Creates a new event by an admin."""
    if request.method == "POST":
        try:
            # Log all headers and POST data for debugging
            print(f"Received headers: {dict(request.headers)}")
            print(f"Received POST data: {dict(request.POST)}")
            print(f"Received FILES: {dict(request.FILES)}")
            auth_header = request.headers.get('Authorization', 'Not provided')
            print(f"Received Authorization header: {auth_header}")
            token = request.headers.get('Authorization', '').replace('Bearer ', '')
            if not token:
                return JsonResponse({'error': 'Authorization token required. Header received: ' + auth_header}, status=401)

            # Validate token (simplified, actual validation should decode and check)
            try:
                admin_email = AccessToken(token).get('email') if token else None
            except Exception as e:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)

            if not admin_email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)

            admin = admin_collection.find_one({'email': admin_email})
            if not admin or admin.get('role') != 'admin':
                return JsonResponse({'error': 'Admin access required'}, status=403)

            # Handle multipart/form-data
            title = request.POST.get('title')
            venue = request.POST.get('venue')
            start_time = request.POST.get('start_time', '').strip()
            end_time = request.POST.get('end_time', '').strip()
            start_date = request.POST.get('start_date', '').strip()
            end_date = request.POST.get('end_date', '').strip()
            cost = request.POST.get('cost')
            image = request.FILES.get('image')
            description = request.POST.get('description', '')
            generate_description = request.POST.get('generate_description', 'false').lower() == 'true'

            # Log raw date/time values for debugging
            print(f"Raw start_date: '{start_date}', start_time: '{start_time}'")
            print(f"Raw end_date: '{end_date}', end_time: '{end_time}'")

            # Validate required fields
            if not all([title, venue, start_time, end_time, start_date, end_date, cost, image]):
                return JsonResponse({'error': 'All fields are required'}, status=400)

            if len(title) > 50:
                return JsonResponse({'error': 'Title must not exceed 50 characters'}, status=400)

            if len(venue) > 150:
                return JsonResponse({'error': 'Venue must not exceed 150 characters'}, status=400)

            # Validate and clean date and time
            try:
                start_datetime = datetime.strptime(f"{start_date} {start_time}", '%Y-%m-%d %H:%M')
                end_datetime = datetime.strptime(f"{end_date} {end_time}", '%Y-%m-%d %H:%M')
            except ValueError as e:
                return JsonResponse({'error': f'Invalid date/time format: {str(e)}'}, status=400)

            if start_datetime >= end_datetime:
                return JsonResponse({'error': 'Start date/time must be before end date/time'}, status=400)

            # Validate image
            image_error = validate_image_format(image)
            if image_error:
                return JsonResponse({'error': image_error}, status=400)

            # Integrate Gemini API for description generation
            if generate_description and all([title, venue, start_date, end_date, cost]):
                prompt = f"Generate a description for an event titled '{title}' at '{venue}' from {start_date} to {end_date} costing {cost} INR."
                response = model.generate_content(prompt)
                if response and hasattr(response, 'text'):
                    ai_description = response.text.strip()
                    description = f"{ai_description}"
                else:
                    return JsonResponse({'error': 'Failed to generate description from AI service'}, status=500)
            elif not description:
                return JsonResponse({'error': 'Description is required unless generated'}, status=400)

            # Store image as base64
            image_data = base64.b64encode(image.read()).decode('utf-8')

            event_data = {
                'title': title,
                'venue': venue,
                'start_time': start_time,
                'end_time': end_time,
                'start_date': start_date,
                'end_date': end_date,
                'cost': cost,
                'image': image_data,
                'description': description,
                'created_by': admin_email,
                'created_at': datetime.now(),
                'status': 'Active'
            }
            result = event_collection.insert_one(event_data)
            event_data['_id'] = str(result.inserted_id)

            return JsonResponse({
                'message': 'Event created successfully',
                'event_id': event_data['_id'],
                'redirect': '/dashboard'
            }, status=201)

        except ValueError as e:
            return JsonResponse({'error': f'Invalid date/time format: {str(e)}'}, status=400)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
@csrf_exempt
def events_list(request):
    """Fetches and lists events for admin or users."""
    try:
        auth_header = request.headers.get('Authorization', 'Not provided')
        print(f"Received Authorization header: {auth_header}")
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return JsonResponse({'error': 'Authorization token required. Header received: ' + auth_header}, status=401)

        # Validate token (use AccessToken, not RefreshToken)
        try:
            user_email = AccessToken(token).get('email') if token else None
            user_role = AccessToken(token).get('role')
        except Exception as e:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        if not user_email:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        # Check if user exists in either collection based on role
        if user_role == 'admin':
            user = admin_collection.find_one({'email': user_email})
        else:
            user = user_collection.find_one({'email': user_email})

        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)

        is_admin = user.get('role') == 'admin'

        # Fetch all active events regardless of user role
        events = list(event_collection.find({'status': 'Active'}))

        # Debug information
        print(f"Found {len(events)} active events")
        print(f"User role: {user_role}")
        print(f"Is admin: {is_admin}")

        # Format events for response
        events_list = [{
            'id': str(event['_id']),
            'title': event['title'],
            'venue': event['venue'],
            'start_date': event['start_date'],
            'end_date': event['end_date'],
            'cost': event['cost'],
            'created_by': event['created_by'],
            'image': event['image'],
            'description': event['description'],
            'start_time': event['start_time'],
            'end_time': event['end_time'],
        } for event in events]

        return JsonResponse({
            'events': events_list,
            'total_events': len(events_list),
            'user_role': user_role
        }, status=200)

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
 