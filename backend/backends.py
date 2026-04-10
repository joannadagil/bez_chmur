from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user_model = get_user_model()
        try:
            email = kwargs.get('email', username)
            user = user_model.objects.get(email=email)
        except user_model.DoesNotExist:
            return None
        
        if user.check_password(password):
            return user
        return None