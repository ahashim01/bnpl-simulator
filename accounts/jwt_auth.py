from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


def custom_user_authentication_rule(user):
    """
    Custom authentication rule that checks if the user is active.
    Replace the default authentication rule.
    """
    return user is not None and user.is_active


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that adds 'is_merchant' and 'username' to the token payload.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["is_merchant"] = user.is_merchant
        token["username"] = user.username

        return token
