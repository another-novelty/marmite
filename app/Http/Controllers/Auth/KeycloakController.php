<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class KeycloakController extends Controller
{
    public function redirectToKeycloak()
    {
        // Keycloak below v3.2 requires no scopes to be set. 
        // Later versions require the openid scope for all requests.
        // e.g return Socialite::driver('keycloak')->scopes(['openid'])->redirect();
        $redirectUrl = Socialite::driver('keycloak')->scopes(['openid'])->redirect();
        return Inertia::location($redirectUrl);
        
    }

    public function handleKeycloakCallback()
    {
        $user = Socialite::driver('keycloak')->user();

        // this line will be needed if you have an exist Eloquent database User
        // then you can user user data gotten from keycloak to query such table
        // and proceed
        $existingUser = User::where('email', $user->email)->first();

        // ... your desire implementation comes here
        if (!$existingUser) {
            $preferredName = $user->user['preferred_username'] ?? $user->name;

            $existingUser = User::create([
                'name' => $preferredName,
                'email' => $user->email,
                'password' => bcrypt(Str::random(24) . now()),
            ]);

            $existingUser->socialLogins()->create([
                'provider' => 'keycloak',
                'provider_id' => $user->id,
            ]);
        } else {
            $existingUser->socialLogins()->firstOrCreate([
                'provider' => 'keycloak',
                'provider_id' => $user->id,
            ]);
        }

        Auth::login($existingUser);
        return redirect()->intended('/');
    }

    public function logout(Request $request)
    {
        // Logout of your app.
        Auth::logout();
        
        // The user will not be redirected back.
        return redirect(Socialite::driver('keycloak')->getLogoutUrl());
    }
}
