<?php

namespace Database\Seeders;

use App\Models\MiteAccess;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()
        ->has(
            MiteAccess::factory()
            ->count(1)
        )
        ->create([
            'name' => 'Fabian',
            'email' => 'faabes@gmail.com',
            'password' => '$2y$12$b9Z01xyFbMnxHbbSV/6iyO02uXt5FgVVYewjUd0UUeF8pG2lbBpJ6'
        ]);
    }
}
