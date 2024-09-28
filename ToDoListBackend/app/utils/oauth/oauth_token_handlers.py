def google_oauth_token_handler(google_oauth_token):
    user_info = google_oauth_token.get('userinfo')
    if not user_info:
        raise ValueError('Google auth token has no user_info key')

    return {
        'user_name': user_info['given_name'],
        'user_surname': user_info['family_name'],
        'user_oauth_id': user_info['sub']
    }