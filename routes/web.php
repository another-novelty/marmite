<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\MiteAccessController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'hasMiteAccess' => Auth::user()->miteAccesses->isNotEmpty(),
        'miteApiKeys' => Auth::user()->miteAccesses,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::apiResource('mite-accesses', MiteAccessController::class);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('/calendar')->group(function () {
        Route::controller(CalendarController::class)->group(function () {
            Route::get('/{id}', 'show')->name('calendar.show');
            Route::get('/', 'index')->name('calendar.index');
        });
    });
});

require __DIR__.'/auth.php';
