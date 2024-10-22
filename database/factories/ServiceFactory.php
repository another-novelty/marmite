<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'mite_id' => random_int(10000, 100000),
            'name' => fake()->company(),
            'note' => fake()->realText(),
            'archived' => false,
            'last_sync_at' => now()
        ];
    }
}
