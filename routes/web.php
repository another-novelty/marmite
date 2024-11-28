<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\MiteAccessController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TimeEntryController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\Auth\KeycloakController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Ramsey\Uuid\Type\Time;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/', function () {
    return Inertia::render('Dashboard', [
        'hasMiteAccess' => Auth::user()->miteAccesses->isNotEmpty(),
        'miteApiKeys' => Auth::user()->miteAccesses,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('login/keycloak', [KeycloakController::class, 'redirectToKeycloak'] )->name('login.keycloak');
Route::get('auth/callback', [KeycloakController::class, 'handleKeycloakCallback']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::apiResource('mite-accesses', MiteAccessController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('/calendar')->group(function () {
        Route::controller(CalendarController::class)->group(function () {
            Route::get('/{mite_access}', 'show')->name('calendar.show');
            Route::get('/', 'index')->name('calendar.index');
        });

        Route::post('mite-accesses/{mite_access}/sync', [MiteAccessController::class, 'sync'])->name('mite.sync');
    });

    Route::resource('entries', TimeEntryController::class)->only(['store', 'update', 'destroy']);
    Route::post('entries/destroyMultiple', [TimeEntryController::class, 'destroyMultiple'])->name('entries.destroyMultiple');
    Route::post('entries/{entry}/sync', [TimeEntryController::class, 'sync'])->name('entries.sync');

    Route::prefix('mite_access/{mite_access}')->group(function () {
        Route::resource('template', TemplateController::class);
    });

    Route::resource('content', ContentController::class)->only(['store', 'update', 'destroy']);
    Route::resource('activity', ActivityController::class)->only(['store', 'update', 'destroy']);
});

require __DIR__.'/auth.php';
