<?php

namespace Database\Factories;

use App\Models\MiteAccess;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Template>
 */
class TemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // get a random mite access id
        $miteAccessId = MiteAccess::inRandomOrder()->first()->id;
        return [
            'name' => 'Time Entry Template ' . random_int(1, 100),
            'description' => $this->faker->text(),
            'mite_access_id' => $miteAccessId,
        ];
    }
}
