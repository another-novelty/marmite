<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Customer;
use App\Models\MiteAccess;
use App\Models\Project;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        User::factory()
            ->has(
                MiteAccess::factory()
                ->count(1)
                ->has(
                    Customer::factory(2)
                    ->has(
                        Project::factory(5)
                    )
                )
                ->has(
                    Service::factory(2)
                )
            )
            ->create([
                'name' => 'Fabian',
                'email' => 'faabes@gmail.com',
                'password' => '$2y$12$b9Z01xyFbMnxHbbSV/6iyO02uXt5FgVVYewjUd0UUeF8pG2lbBpJ6'
            ]);
    }
}
