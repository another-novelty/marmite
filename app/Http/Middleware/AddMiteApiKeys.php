<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AddMiteApiKeys
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() === false) {
            return $next($request);
        }

        Inertia::share('mite.apiKeys', auth()->check() ? auth()->user()->miteAccesses : null);

        return $next($request);
    }
}
