<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
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
            'archived' => false,
            'note' => fake()->realText(),
            'last_sync_at' => now(),
        ];
    }
}
